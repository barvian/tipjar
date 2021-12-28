<script>
	import { onMount, getContext } from 'svelte'
	import { stripeKey, paypalKey } from './const'

	export let currency = 'usd'
	export let label = 'Donation'
	export let amount = 0

	const paypalButtonHeight = 40

	const stripeReq = getContext(stripeKey)
	const paypalReq = getContext(paypalKey)

	let paymentRequest, walletEnabled = false, walletButton, paypalContainer
	$: paymentRequest?.update({
		total: { label, amount }
	})

	onMount(async () => {
		const stripe = await stripeReq
		const elements = stripe.elements()
		paymentRequest = stripe.paymentRequest({
		  country: 'US',
		  currency: 'usd',
		  total: { label, amount },
		  requestPayerEmail: true
		})

		walletEnabled = Boolean(await paymentRequest.canMakePayment())
		if (walletEnabled) {
			const prButton = elements.create('paymentRequestButton', {
				paymentRequest,
				style: {
					paymentRequestButton: {
						height: '48px'
					}
				}
			})	
			prButton.mount(walletButton);
		} else {
			const paypal = await paypalReq
			paypal.Buttons({
				style: {
					layout: 'horizontal',
					tagline: false,
					height: paypalButtonHeight
				}
			}).render(paypalContainer)
		}
	})
</script>

<div class="methods" style="--button-height: {paypalButtonHeight}px;">
	<div hidden={!walletEnabled} bind:this={walletButton} class="wallet"></div>
	<div hidden={walletEnabled} bind:this={paypalContainer} class="paypal"></div>
	<button hidden={walletEnabled} class="tip-button card">
		<svg viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2H0Zm0 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4H0Zm3 5a1 1 0 0 1 1-1h1a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1Z" fill="currentColor"/></svg>
		Card
	</button>
</div>

<style>
	.methods {
		display: flex;
		flex-flow: column nowrap;
		gap: 8px;
		width: 100%;
	}

	.methods :global(.tip-button) {
		height: var(--button-height);
		white-space: nowrap;
	}

	.paypal {
		height: var(--button-height);
		overflow: hidden;
	}

	.paypal > :global(.paypal-buttons) {
		display: block !important;
	}
</style>