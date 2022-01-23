import { Frequency } from './const'

export default class ApiClient extends EventTarget {
	set id(val) { this.close(); return this._id = val }
	get id() { return this._id }

	constructor(id) {
		super()
		this.id = id

		this.onMessage = this.onMessage.bind(this)
		this.createPaymentIntent = this.createPaymentIntent.bind(this)
	}

	get eventSource() {
		if (!this._eventSource) this._eventSource = new EventSource(`__apiRoot/v1/${this.id}/events`)
		return this._eventSource
	}

	async _fetch(path, { method = 'GET', timeout = 10000, body = {}, ...params } = {}) {
		const controller = new AbortController()
		const id = setTimeout(() => controller.abort(), timeout)

		const response = await fetch(`__apiRoot${path}`, {
			...params,
			method,
			body: JSON.stringify(body),
			signal: controller.signal
		})
		clearTimeout(id)
		return response
	}

	get(path, params) { return this._fetch(path, { ...params, method: 'GET' }) }
	post(path, params) { return this._fetch(path, { ...params, method: 'POST' }) }

	async createPaymentIntent({ amount, frequency, email } = {}) {
		return this.post(`/v1/${this.id}/create-payment-intent`, {
			body: { amount, frequency: frequency.value, email },
			timeout: 5000
		})
	}

	// async updatePaymentIntent({ client_secret, email } = {}) {
	// 	return fetch(`${BASE_URL}/${this.id}/update-payment-intent`, {
	// 		method: 'POST',
	// 		body: JSON.stringify({ client_secret, email })
	// 	})
	// }

	async getPaypalPlanId({ amount, frequency } = {}) {
		return this.get(`${BASE_URL}/${this.id}/get-paypal-plan-id`, {
			body: { amount, frequency: frequency.value }
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