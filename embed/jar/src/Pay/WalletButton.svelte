<script>
	import { onMount, getContext } from 'svelte'
	import { p, unresolved } from '../lib/util'
	import { stripeKey, Frequency, APIErrorCode } from '../lib/const'

	export let label = 'Donation'
	export let currency
	export let height = 40
	export let pill
	export let amount
	export let frequency
	export let enabled = unresolved()
	export let createPaymentIntent
	export let error

	const stripeReq = getContext(stripeKey)

	let paymentRequest, container, element, ready
	$: paymentRequest?.update({
		total: { label, amount }
	})

	let clientSecret
	$: if (!clientSecret) error = null
	function createIntent(email) {
		return createPaymentIntent({ amount, email, frequency, currency })
			.then(response => response.clientSecret)
			.catch(e => {
				error = e
				throw e
			})
	}

	function onClick(event) {
		// validate()
	}

	async function onPaymentMethod(event) {
		try {
			clientSecret = await createIntent(event.payerEmail)
		} catch (error) {
			event.complete('fail')
			return
		}

		const stripe = await stripeReq
		const confirmResult = await stripe.confirmCardPayment(
			clientSecret,
			{
				payment_method: event.paymentMethod.id,
				receipt_email: event.payerEmail
			},
			{ handleActions: false }
		)

		if (confirmResult.error) {
			// Report to the browser that the payment failed, prompting it to
			// re-show the payment interface, or show an error message and close
			// the payment interface.
			event.complete('fail')
	    } else {
			// Report to the browser that the confirmation was successful, prompting
			// it to close the browser payment method collection interface.
			event.complete('success')
			// Check if the PaymentIntent requires any actions and if so let Stripe.js
			// handle the flow. If using an API version older than "2019-02-11"
			// instead check for: `paymentIntent.status === "requires_source_action"`.
			if (confirmResult.paymentIntent.status === 'requires_action') {
				// Let Stripe.js handle the rest of the payment flow.
				const actionResult = await stripe.confirmCardPayment(clientSecret)
				if (actionResult.error) {
					// The payment failed -- ask your customer for a new payment method.
				} else {
					// The payment has succeeded.
				}
			} else {
				// The payment has succeeded.
			}
	    }
	}

	async function renderElement() {
		const stripe = await stripeReq
		const elements = stripe.elements()

		paymentRequest = stripe.paymentRequest({
		  country: 'US',
		  currency,
		  total: { label, amount },
		  requestPayerEmail: true
		})

		element = elements.create('paymentRequestButton', {
		  paymentRequest,
		  style: {
		  	paymentRequestButton: {
		  		height: `${height}px`
		  	}
		  }
		})

		element.on('click', onClick)
		paymentRequest.on('paymentmethod', onPaymentMethod)

		const canMakePayment = paymentRequest.canMakePayment().then(can => Boolean(can))
		if (await canMakePayment) {
			enabled = new Promise((resolve, reject) => {
				element.on('ready', () => {
					ready = true
					resolve(true)
				})
			})
			element.mount(container)
		} else {
			enabled = p(false)
		}
	}

	onMount(() => {
		renderElement()
		return () => element?.destroy()
	})
</script>

<div hidden={!ready} bind:this={container} class:pill class="tipjar-wallet-button" />

<style>
	.tipjar-wallet-button.pill {
		clip-path: inset(0 0 0 0 round 999px);
	}
</style>