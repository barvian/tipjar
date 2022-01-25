<script>
	import { APIErrorCode } from '../lib/const'
	import { fade } from 'svelte/transition'

	export let error

	let text
	$: {
		if (!error) text = ''
		else if (error.code === APIErrorCode.STRIPE_TOO_SMALL) {
			text = `This donation is too small for our <a href="https://stripe.com/" target="_blank">payment processor</a> 🙁`
		} else if (error.paypalError) {
			text = `PayPal was unable to process this donation.`
		} else {
			text = `We couldn't process this donation. Please try again.`
		}
	}
</script>

{#if text}<div in:fade class="tipjar-error">{@html text}</div>{/if}

<style>
	.tipjar-error {
		color: rgb(223, 27, 65);
		margin-bottom: 0.85em;
		text-align: center;
	}
</style>