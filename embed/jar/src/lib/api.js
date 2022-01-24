import { Frequency, APIErrorCode } from './const'

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
		if (!this._eventSource) this._eventSource = new EventSource(this.baseUrl+'/events')
		return this._eventSource
	}

	get baseUrl() {
		return `__apiRoot/v1${this.id === 'self' ? '' : this.id}`
	}

	async _fetch(path, { method = 'GET', timeout = 30000, body = {}, ...params } = {}) {
		const controller = new AbortController()
		const id = setTimeout(() => controller.abort(), timeout)

		const response = await fetch(this.baseUrl+path, {
			...params,
			method,
			body: JSON.stringify(body),
			headers: {
				'Content-Type': 'application/json'
			},
			signal: controller.signal
		}).then(async res => {
			if (res.ok) return res.json()

			let json
			try {
				json = await res.json()
				if (json?.error?.code) json.error.code = APIErrorCode.fromJSON(json.error.code)
			} catch (error) { }
			return Promise.reject(json?.error || json || res)
		})
		clearTimeout(id)
		return response
	}

	get(path, params) { return this._fetch(path, { ...params, method: 'GET' }) }
	post(path, params) { return this._fetch(path, { ...params, method: 'POST' }) }

	async createPaymentIntent({ amount, frequency, email, currency } = {}) {
		return this.post('/create-payment-intent', {
			body: { amount, frequency, email, currency }
		})
	}

	// async updatePaymentIntent({ client_secret, email } = {}) {
	// 	return fetch(`${BASE_URL}/${this.id}/update-payment-intent`, {
	// 		method: 'POST',
	// 		body: JSON.stringify({ client_secret, email })
	// 	})
	// }

	async getPaypalPlanId({ amount, frequency, currency } = {}) {
		return this.get(`${BASE_URL}/${this.id}/get-paypal-plan-id`, {
			body: { amount, frequency }
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