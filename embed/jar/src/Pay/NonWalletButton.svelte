<script>
	import { Frequency } from '../lib/const'
	import { unresolved } from '../lib/util'
	import EmailField from './EmailField.svelte'
	import PaymentElement from './PaymentElement.svelte'

	export let amount
	export let frequency
	export let startPaying = false
	export let paying = startPaying
	export let label = 'Pay'
	export let createPaymentIntent

	let paymentIntent
	$: if (!paying) paymentIntent = null

	let email, emailValid
	$: needEmail = frequency !== Frequency.ONE_TIME

	function createIntent(event) {
		event.preventDefault()
		
		paymentIntent = createPaymentIntent({ amount, frequency, email })
	}
</script>

{#await (paymentIntent || unresolved())}
	{#if !paying && needEmail}
	<button class="tipkit-btn" on:click={() => paying = true}>
		Continue
	</button>
	{:else if !paying && !needEmail}
	<button class="tipkit-btn" on:click={createIntent}>
		{#await paymentIntent}spinner{/await}Continue to payment
	</button>
	{:else}
		<form on:submit={createIntent}>
			<EmailField bind:value={email} bind:valid={emailValid} />
			<button class="tipkit-btn" disabled={!emailValid} type="submit">
				{#await paymentIntent}spinner{/await}Continue to payment
			</button>
		</form>
	{/if}
{:then result}
	<PaymentElement {label} {email} clientSecret={result.clientSecret} />
{:catch error}
	Error
{/await}

