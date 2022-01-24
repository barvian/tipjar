<script>
	import { Frequency, APIErrorCode } from '../lib/const'
	import { unresolved } from '../lib/util'
	import EmailField from './EmailField.svelte'
	import PaymentElement from './PaymentElement.svelte'

	export let amount
	export let frequency
	export let currency
	export let paying = false
	export let expanded = false
	export let label = 'Pay'
	export let useExtraStepForEmail = false
	export let createPaymentIntent

	let email, emailValid
	$: needEmail = frequency !== Frequency.ONE_TIME
	$: showEmailScreen = needEmail && (useExtraStepForEmail ? expanded && !clientSecret : !clientSecret)
	$: expanded = !!clientSecret

	export function back() {
		clientSecret = null
		expanded = false
	}

	let clientSecret, error
	$: if (!clientSecret) error = null
	async function createIntent(event) {
		event.preventDefault()
		if (needEmail && (!email || !emailValid)) return
		
		paying = true
		try {
			const response = await createPaymentIntent({ amount, frequency, email, currency })
			clientSecret = response.clientSecret
		} catch (e) {
			error = e
		}
		paying = false
	}
</script>

{#if clientSecret}
	{#key clientSecret}
	<PaymentElement {clientSecret} {label} {email} />
	{/key}
{:else if showEmailScreen}
	<form on:submit={createIntent}>
		<EmailField bind:value={email} bind:valid={emailValid} />
		<button class="tipkit-btn" disabled={!emailValid} type="submit">
			{#if paying}spinner{/if}Continue to payment
		</button>
	</form>
{:else if needEmail}
	<button class="tipkit-btn" on:click={() => expanded = true}>
		Continue
	</button>
{:else}
	{#if error}{error.code}{/if}
	<button class="tipkit-btn" on:click={createIntent}>
		{#if paying}spinner{/if}Continue to payment
	</button>
	{/if}
