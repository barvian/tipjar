<script>
	import { onMount, getContext } from 'svelte'
	import { stripeKey, APIErrorCode } from '../lib/const'
	import WalletButton from './WalletButton.svelte'
	import PaypalButton from './PaypalButton.svelte'
	import NonWalletButton from './NonWalletButton.svelte'
	import Error from './Error.svelte'
	import Spinner from '../Spinner.svelte'

	export let currency
	export let amount = 0
	export let floatingAmount = 0
	export let frequency
	export let paying = false
	export let expanded
	export let label
	export let createPaymentIntent
	export let getPaypalPlanId
	export let paypalClientId
	export let buttonHeight
	export let pill

	let error
	$: amount, frequency, onChange()
	function onChange() {
		// if (error?.code === APIErrorCode.STRIPE_TOO_SMALL || error?.paypalError)
		error = null
	}

	let nonWallet
	export function back() {
		nonWallet?.back()
	}

	let walletPaying, nonWalletPaying, paypalPaying
	$: paying = walletPaying || nonWalletPaying || paypalPaying

	const stripeReq = getContext(stripeKey)

	let walletEnabled
</script>

<div class="tipjar-pay" class:pill class:error style="--button-height: {buttonHeight}px;">
	<Error {error} />
	<WalletButton {createPaymentIntent} {pill} height={buttonHeight} {currency} {amount} {frequency} bind:enabled={walletEnabled} bind:paying={walletPaying} bind:error />
	{#await walletEnabled}
		<Spinner height={buttonHeight} />
	{:then enabled}
		{#if !enabled}
			<NonWalletButton {createPaymentIntent} useExtraStepForEmail={!!paypalClientId} {label} bind:this={nonWallet} bind:paying={nonWalletPaying} bind:expanded {currency} {amount} {frequency} bind:error />
			{#if paypalClientId}
				<span class="tipkit-or" hidden={expanded}>or</span>
				<PaypalButton height={buttonHeight} {pill} hidden={expanded} bind:paying={paypalPaying} {currency} {floatingAmount} {frequency} {paypalClientId} {getPaypalPlanId} bind:error />
			{/if}
		{/if}
	{/await}
</div>

<style>
	.tipjar-pay {
		margin-top: 0.75em;
	}

		.tipjar-pay.error {
			margin-top: 0.5em;
		}

	.tipjar-pay :global(.tipkit-btn) {
		border-radius: 4px; /* match wallet/PayPal radii */
		height: var(--button-height);
	}

		.tipjar-pay.pill :global(.tipkit-btn) {
			border-radius: 9999px;
		}

	.tipkit-or {
		color: rgba(0, 0, 0, 0.5);
		display: block;
		font-size: 0.85rem;
		margin-bottom: 0.5em;
		margin-top: 0.45em;
		overflow: hidden;
		position: relative;
		text-align: center;
	}

		.tipkit-or::before,
		.tipkit-or::after {
			background: rgba(0, 0, 0, 0.1);
			content: '';
			height: 1px;
			position: absolute;
			top: 50%;
		}

		.tipkit-or::before {
			left: 2px; /* see button radius set above */
			right: calc(50% + 1em);
		}

		.tipkit-or::after {
			left: calc(50% + 1em);
			right: 2px;
		}

			/*.tipjar-pay.pill .tipkit-or::before {
				left: calc(var(--button-height) / 2 - 5px);
			}

			.tipjar-pay.pill .tipkit-or::after {
				right: calc(var(--button-height) / 2 - 5px);
			}*/
</style>