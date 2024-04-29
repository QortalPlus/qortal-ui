import {css, html, LitElement} from 'lit'
import {Epml} from '../../../../epml.js'
import {get, registerTranslateConfig, translate, use} from '../../../../../core/translate'
import '@polymer/paper-dialog/paper-dialog.js'
import * as Highcharts from 'highcharts'
import Exporting from 'highcharts/modules/exporting'
import StockChart from 'highcharts/modules/stock'
import 'highcharts/highcharts-more.js'
import 'highcharts/modules/accessibility.js'
import 'highcharts/modules/boost.js'
import 'highcharts/modules/data.js'
import 'highcharts/modules/export-data.js'
import 'highcharts/modules/offline-exporting.js'

registerTranslateConfig({
	loader: lang => fetch(`/language/${lang}.json`).then(res => res.json())
})

Exporting(Highcharts)
StockChart(Highcharts)

let nmcChartDialog

const parentEpml = new Epml({ type: 'WINDOW', source: window.parent })

class NmcCharts extends LitElement {
	static get properties() {
		return {
			isLoadingTradesChart: { type: Boolean },
			nmcTrades: { type: Array },
			nmcPrice: { type: Array }
		}
	}

	static get styles() {
		return css`
			.loadingContainer {
				height: 100%;
				width: 100%;
			}

			.trades-chart {
				color: var(--black);
				background: var(--white);
				border: 1px solid var(--black);
				border-radius: 25px;
				padding: 15px;
			}

			.chart-container {
				margin: auto;
				color: var(--black);
				text-align: center;
				padding: 15px;
				height: 30vh;
				width: 80vw;
			}

			.chart-info-wrapper {
				background: transparent;
				height: 38vh;
				width: 83vw;
				overflow: auto;
			}

			.chart-loading-wrapper {
				color: var(--black);
				background: var(--white);
				border: 1px solid var(--black);
				border-radius: 15px;
			}
		`
	}

	constructor() {
		super()
		this.theme = localStorage.getItem('qortalTheme') ? localStorage.getItem('qortalTheme') : 'light'
		this.isLoadingTradesChart = false
		this.nmcTrades = []
		this.nmcPrice = []
	}

	render() {
		return html`
			<paper-dialog id="loadChartDialog" class="chart-loading-wrapper" modal>
				<div class="loadingContainer" style="display:${this.isLoadingTradesChart ? 'inline-block' : 'none'}">
					<span style="color: var(--black);">${translate("login.loading")}</span>
				</div>
			</paper-dialog>
			<paper-dialog id="nmcChartDialog" class="chart-info-wrapper">
				<div class="chart-container">
					<div id='nmcStockPriceContainer' class='trades-chart'></div>
				</div>
			</paper-dialog>
		`
	}

	async firstUpdated() {
		this.changeTheme()
		this.changeLanguage()

		window.addEventListener('storage', () => {
			const checkLanguage = localStorage.getItem('qortalLanguage')
			const checkTheme = localStorage.getItem('qortalTheme')

			use(checkLanguage)

			this.theme = (checkTheme) ? checkTheme : 'light'
			document.querySelector('html').setAttribute('theme', this.theme)
		})
	}

	async loadTradesChart() {
		this.isLoadingTradesChart = true
		this.shadowRoot.getElementById('loadChartDialog').open()
		await this.getNmcTrades()
		this.isLoadingTradesChart = false
		this.shadowRoot.getElementById('loadChartDialog').close()
		this.enableNmcStockPriceChart()
	}

	async getNmcTrades() {
		let currentNmcTimestamp = Date.now()
		const monthBackNmc = currentNmcTimestamp - 31556952000
           	await parentEpml.request("apiCall", { url: `/crosschain/trades?foreignBlockchain=NAMECOIN&minimumTimestamp=${monthBackNmc}&limit=0&reverse=false` }).then((res) => {
			this.nmcTrades = res
		})
		this.nmcPrice = this.nmcTrades.map(item => {
			const nmcSellPrice = this.round(parseFloat(item.foreignAmount) / parseFloat(item.qortAmount))
			return [item.tradeTimestamp, parseFloat(nmcSellPrice)]
		}).filter(item => !!item)
	}

	enableNmcStockPriceChart() {
            const nmcStockPriceData = this.nmcPrice
            const header = 'QORT / NMC ' + get("tradepage.tchange49")
		Highcharts.stockChart(this.shadowRoot.querySelector('#nmcStockPriceContainer'), {
			accessibility: {
				enabled: false
			},
			credits: {
				enabled: false
			},
			rangeSelector: {
				selected: 1,
				labelStyle: {color: 'var(--black)'},
				inputStyle: {color: '#03a9f4'}
			},
			chart: {
				backgroundColor: 'transparent'
			},
			title: {
				text: header,
				style: {color: 'var(--black)'}
			},
			xAxis: {
				labels: {
					style: {
						color: '#03a9f4'
					}
				}
			},
			yAxis: {
				labels: {
					style: {
						color: '#03a9f4'
					}
				}
			},
			series: [{
				name: 'QORT / NMC',
				data: nmcStockPriceData,
				tooltip: {
					valueDecimals: 8
				}
			}]
		})
	}

	async open() {
		await this.loadTradesChart()
		this.shadowRoot.getElementById('nmcChartDialog').open()
	}

	changeTheme() {
		const checkTheme = localStorage.getItem('qortalTheme')
		this.theme = (checkTheme) ? checkTheme : 'light'
		document.querySelector('html').setAttribute('theme', this.theme);
	}

	changeLanguage() {
		const checkLanguage = localStorage.getItem('qortalLanguage')

		if (checkLanguage === null || checkLanguage.length === 0) {
			localStorage.setItem('qortalLanguage', 'us')
			use('us')
		} else {
			use(checkLanguage)
		}
	}

	round(number) {
		return (Math.round(parseFloat(number) * 1e8) / 1e8).toFixed(8)
	}
}

window.customElements.define('nmc-charts', NmcCharts)

const chartsnmc = document.createElement('nmc-charts')
nmcChartDialog = document.body.appendChild(chartsnmc)

export default nmcChartDialog
