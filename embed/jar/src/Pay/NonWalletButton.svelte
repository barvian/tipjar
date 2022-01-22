<script>
	import { onMount, getContext } from 'svelte'
	import { stripeKey, Frequency } from '../lib/const'
	import ContinueButton from './ContinueButton.svelte'
	import EmailField from './EmailField.svelte'

	export let amount
	export let frequency
	export let paying = false
	export let label = 'Pay'
	export let createPaymentIntent

	const stripeReq = getContext(stripeKey)
	let paymentIntent
	$: if (!paying) paymentIntent = null

	let paymentElementContainer, elements, element, validated = false

	async function renderElement() {
		const stripe = await stripeReq
		elements = stripe.elements({
			clientSecret: 'pi_3KKXDJIkwNImZu7s2FU8Zjg8_secret_wyGyosNzxA1vgOWvEzXEV15Ht',
			appearance: {
				theme: 'flat',
				variables: {
					borderRadius: '4px',
					spacingUnit: '2px'
				}
			}
		})

		element = elements.create('payment', {
			wallets: { // potentially save some vertical height
				applePay: 'never',
				googlePay: 'never'
			},
			fields: {
				billingDetails: {
			      email: 'never'
			    }
			}
		})

		element.mount(paymentElementContainer)
	}

	async function onClick(event) {
		event.preventDefault()
		paymentIntent = await createPaymentIntent()

		paying = true

		(await stripeReq).confirmPayment({
			elements,
			confirmParams: {
				return_url: window.location.url,
				payment_method_data: {
					billing_details: {
						email: '....'
					}
				}
			},
			redirect: 'if_required'
		})
	}

	onMount(() => {
		renderElement()
		return () => element?.destroy()
	})
</script>

{#if !paying}
<ContinueButton
	toEmail={frequency !== Frequency.ONE_TIME}
	on:click={frequency !== Frequency.ONE_TIME ? showPaymentElement : showEmail}
/>
{/if}
<div hidden={!paying} bind:this={paymentElementContainer} />
{#if paying}
{#if frequency === Frequency.ONE_TIME}
<EmailField bind:valid={emailValid} />
{/if}
<button disabled={!validated} class="tipkit-btn">
	{label}
</button>
{/if}
