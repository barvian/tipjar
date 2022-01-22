import { Frequency } from './const'

const BASE_URL = DEV ? 'http://localhost:4242/v1' : 
	'https://api.tipkit.io/v1'

class DonationStream extends EventTarget {
  doSomething() {
    this.dispatchEvent(new Event('something'));
  }
}

export class ApiClient extends EventTarget {
	set id(val) { this.close(); return this._id = val }
	get id() { return this._id }

	constructor(id) {
		this.id = id
		this.onMessage = this.onMessage.bind(this)
	}

	get eventSource() {
		if (!this._eventSource) this._eventSource = new EventSource(`${BASE_URL}/${this.id}/events`)
	}

	async createPaymentIntent({ amount, frequency, email } = {}) {
		return fetch(`${BASE_URL}/${this.id}/create-payment-intent`, {
			method: 'POST',
			body: JSON.stringify({ amount, frequency: frequency.value, email })
		})
	}

	async updatePaymentIntent({ client_secret, email } = {}) {
		return fetch(`${BASE_URL}/${this.id}/update-payment-intent`, {
			method: 'POST',
			body: JSON.stringify({ client_secret, email })
		})
	}

	async getPaypalPlanId({ amount, frequency } = {}) {
		return fetch(`${BASE_URL}/${this.id}/get-paypal-plan-id`, {
			method: 'GET',
			body: JSON.stringify({ amount, frequency: frequency.value })
		})
	}

	onMessage(event) {
		this.dispatchEvent(new Event('donation'))
	}

	listen() {
		this.eventSource.addEventListener('message', this.onMessage)
	}

	close() {
		this._eventSource?.removeEventListener('message', this.onMessage)
		this._eventSource?.close()
		this._eventSource = null
	}
}