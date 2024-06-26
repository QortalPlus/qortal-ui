import { html, LitElement } from 'lit'
import { connect } from 'pwa-helpers'
import { store } from '../store'
import { appInfoStyles } from '../styles/core-css'

// Multi language support
import { translate } from '../../translate'

class AppInfo extends connect(store)(LitElement) {
	static get properties() {
		return {
			nodeInfo: { type: Array },
			coreInfo: { type: Array },
			nodeConfig: { type: Object },
			theme: { type: String, reflect: true }
		}
	}

	static get styles() {
		return [appInfoStyles]
	}

	constructor() {
		super()
		this.nodeInfo = []
		this.coreInfo = []
		this.nodeConfig = {}
		this.theme = localStorage.getItem('qortalTheme') ? localStorage.getItem('qortalTheme') : 'light'
	}

	render() {
		return html`
			<div id="profileInMenu">
				<span class="info">${translate("appinfo.uiversion")}: ${this.nodeConfig.version ? this.nodeConfig.version : ''}</span>
				${this._renderCoreVersion()}
				<span class="info">${translate("appinfo.blockheight")}: ${this.nodeInfo.height ? this.nodeInfo.height : ''}  <span class=${this.cssStatus}>${this._renderStatus()}</span></span>
				<span class="info">${translate("appinfo.peers")}: ${this.nodeInfo.numberOfConnections ? this.nodeInfo.numberOfConnections : ''}
			</div>
		`
	}

	firstUpdated() {
		this.getNodeInfo()
		this.getCoreInfo()

		setInterval(() => {
			this.getNodeInfo()
			this.getCoreInfo()
		}, 60000)
	}

	async getNodeInfo() {
		const appinfoNode = store.getState().app.nodeConfig.knownNodes[store.getState().app.nodeConfig.node]
		const appinfoUrl = appinfoNode.protocol + '://' + appinfoNode.domain + ':' + appinfoNode.port
		const url = `${appinfoUrl}/admin/status`

		await fetch(url).then(response => {
			return response.json()
		}).then(data => {
			this.nodeInfo = data
		}).catch(err => {
			console.error('Request failed', err)
		})
	}

	async getCoreInfo() {
		const appinfoNode = store.getState().app.nodeConfig.knownNodes[store.getState().app.nodeConfig.node]
		const appinfoUrl = appinfoNode.protocol + '://' + appinfoNode.domain + ':' + appinfoNode.port
		const url = `${appinfoUrl}/admin/info`

		await fetch(url).then(response => {
			return response.json()
		}).then(data => {
			this.coreInfo = data
		}).catch(err => {
			console.error('Request failed', err)
		})
	}

	_renderStatus() {
		if (this.nodeInfo.isMintingPossible === true && this.nodeInfo.isSynchronizing === true) {
			this.cssStatus = 'blue'
			return html`${translate("appinfo.minting")}`
		} else if (this.nodeInfo.isMintingPossible === true && this.nodeInfo.isSynchronizing === false) {
			this.cssStatus = 'blue'
			return html`${translate("appinfo.minting")}`
		} else if (this.nodeInfo.isMintingPossible === false && this.nodeInfo.isSynchronizing === true) {
			this.cssStatus = 'black'
			return html`(${translate("appinfo.synchronizing")}... ${this.nodeInfo.syncPercent !== undefined ? this.nodeInfo.syncPercent + '%' : ''})`
		} else if (this.nodeInfo.isMintingPossible === false && this.nodeInfo.isSynchronizing === false) {
			this.cssStatus = 'black'
			return ''
		} else {
			return ''
		}
	}

	_renderCoreVersion() {
		return html`<span class="info">${translate("appinfo.coreversion")}: ${this.coreInfo.buildVersion ? this.coreInfo.buildVersion : ''}</span>`
	}

	stateChanged(state) {
		this.nodeConfig = state.app.nodeConfig
	}
}

window.customElements.define('app-info', AppInfo)