<script>
	import { onMount, getContext } from 'svelte'
	import { stripeKey } from '../lib/const'
	import { Frequency, APIErrorCode } from '../lib/const'

	export let label = 'Donation'
	export let currency
	export let height = 40
	export let amount
	export let frequency
	export let enabled
	export let createPaymentIntent

	const stripeReq = getContext(stripeKey)

	let paymentRequest, container, element
	$: paymentRequest?.update({
		total: { label, amount }
	})

	let clientSecret, error
	$: if (!clientSecret) error = null
	function createIntent(email) {
		clientSecret = createPaymentIntent({ amount, email, frequency, currency })
			.then(response => response.clientSecret)
			.catch(e => error = e)
		return clientSecret
	}

	function onClick(event) {
		// validate()
		if (frequency === Frequency.ONE_TIME) { // don't need e-mail
			createIntent()
		}
	}

	async function onPaymentMethod(event) {
		const stripe = await stripeReq
		if (!clientSecret) await createIntent(event.payerEmail)
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
			ev.complete('fail')
	    } else {
			// Report to the browser that the confirmation was successful, prompting
			// it to close the browser payment method collection interface.
			ev.complete('success')
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
		paymentRequest.on('paymentMethod', onPaymentMethod)

		enabled = paymentRequest.canMakePayment().then(can => Boolean(can))
		if (await enabled) element.mount(container)
	}

	onMount(() => {
		renderElement()
		return () => element?.destroy()
	})
</script>

<div bind:this={container} />