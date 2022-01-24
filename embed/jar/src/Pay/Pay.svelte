<script>
	import { onMount, getContext } from 'svelte'
	import { stripeKey } from '../lib/const'
	import WalletButton from './WalletButton.svelte'
	import PaypalButton from './PaypalButton.svelte'
	import NonWalletButton from './NonWalletButton.svelte'
	import { unresolved} from '../lib/util'

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

	let nonWallet
	export function back() {
		nonWallet?.back()
	}

	let walletPaying, nonWalletPaying, paypalPaying
	$: paying = walletPaying || nonWalletPaying || paypalPaying

	const stripeReq = getContext(stripeKey)
	const buttonHeight = 40

	let walletEnabledP = unresolved()
</script>

<div class="pay" style="--button-height: {buttonHeight}px;">
	<WalletButton {createPaymentIntent} height={buttonHeight} {currency} {amount} {frequency} bind:enabled={walletEnabledP} bind:paying={walletPaying} />
	{#await walletEnabledP}
		<div style="height: {buttonHeight}px">loading</div>
	{:then walletEnabled}
		{#if !walletEnabled}
			<NonWalletButton {createPaymentIntent} useExtraStepForEmail={!!paypalClientId} {label} bind:this={nonWallet} bind:paying={nonWalletPaying} bind:expanded {currency} {amount} {frequency} />
			{#if paypalClientId}
				<span class="tipkit-or" hidden={expanded}>or</span>
				<PaypalButton height={buttonHeight} hidden={expanded} bind:paying={paypalPaying} {currency} {floatingAmount} {frequency} {paypalClientId} {getPaypalPlanId} />
			{/if}
		{/if}
	{/await}
</div>

<style>
	.pay :global(.tipkit-btn) {
		height: var(--button-height);
	}

	.tipkit-or {
		color: rgba(0, 0, 0, 0.5);
		display: block;
		font-size: 0.85rem;
		margin-bottom: 0.3em;
		margin-top: 0.25em;
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
			width: 100%;
		}

		.tipkit-or::before {
			right: calc(50% + 1em);
		}

		.tipkit-or::after {
			left: calc(50% + 1em);
		}
</style>