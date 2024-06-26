import { html, LitElement } from 'lit'
import isElectron from 'is-electron'
import '@polymer/paper-icon-button/paper-icon-button.js'
import '@polymer/iron-icons/iron-icons.js'

// Multi language support
import { translate } from '../../translate'

class CheckForUpdate extends LitElement {
	static get properties() {
		return {
			theme: { type: String, reflect: true }
		}
	}

	constructor() {
		super()
		this.theme = localStorage.getItem('qortalTheme') ? localStorage.getItem('qortalTheme') : 'light'
	}

	render() {
		return html`
			${this.renderUpdateButton()}
		`
	}

	firstUpdated() {
		// ...
	}

	renderUpdateButton() {
		if (!isElectron()) {
			return html``
		} else {
			return html`
				<div style="display: inline;">
					<paper-icon-button icon="icons:get-app" @click=${() => this.checkupdate()} title="${translate("appspage.schange38")} UI"></paper-icon-button>
				</div>
			`
		}
	}

	checkupdate() {
		window.electronAPI.checkForUpdate()
	}
}

window.customElements.define('check-for-update', CheckForUpdate)