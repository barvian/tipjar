<script>
	import { onMount, getContext } from 'svelte'
	import { stripeKey, paypalKey } from './const'

	export let currency = 'usd'
	export let label = 'Donation'
	export let amount = 0

	const { stripeReq, paymentRequestP, walletReadyP } = getContext(stripeKey)
	const paypalReq = getContext(paypalKey)

	$: paymentRequestP?.then(pr => pr.update({
		total: { label, amount }
	}))

	let walletButton

	onMount(async () => {
		const elements = (await stripeReq).elements()
		const prButton = elements.create('paymentRequestButton', {
			paymentRequest: await paymentRequestP
		})
		prButton.mount(walletButton)
	})
</script>
<div bind:this={walletButton}></div>
{#await walletReadyP then walletReady}
	{walletReady}
{/await}