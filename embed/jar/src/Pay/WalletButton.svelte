<script>
	import { onMount, getContext } from 'svelte'
	import { stripeKey } from '../lib/const'

	export let label = 'Donation'
	export let currency = 'usd'
	export let height = 40
	export let amount
	export let frequency
	export let enabled

	const stripeReq = getContext(stripeKey)

	let paymentRequest, container, element
	$: paymentRequest?.update({
		total: { label, amount }
	})

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

		enabled = paymentRequest.canMakePayment().then(can => Boolean(can))
		if (await enabled) element.mount(container)
	}

	onMount(() => {
		renderElement()
		return () => element?.destroy()
	})
</script>

<div bind:this={container} />