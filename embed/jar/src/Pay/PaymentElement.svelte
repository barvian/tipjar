<script>
	import { onMount, getContext } from 'svelte'
	import { stripeKey } from '../lib/const'
	import EmailField from './EmailField.svelte'

	export let clientSecret
	export let label = 'Pay'
	export let email
	let collectEmail = !email

	const stripeReq = getContext(stripeKey)

	let container, elements, element, ready

	let elementComplete = false, emailValid
	$: complete = elementComplete && emailValid

	async function renderElement() {
		const stripe = await stripeReq
		elements = stripe.elements({
			clientSecret,
			appearance: {
				labels: 'floating',
				theme: 'flat',
				variables: {
					borderRadius: '4px',
					spacingUnit: '2px'
				},
				rules: {
					'.Label--floating': {
						fontSize: '0.75rem',
					}
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

		element.mount(container)
		element.on('change', onChange)
		element.on('ready', () => ready = true)
	}

	function onChange(event) {
		elementComplete = event.complete
	}

	async function onSubmit(event) {
		event.preventDefault()
		const stripe = await stripeReq
		stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: window.location.url,
				payment_method_data: {
					billing_details: {
						email
					}
				}
			},
			redirect: 'if_required'
		})
	}

	onMount(() => {
		renderElement()
		return () => {
			try { element?.destroy() } catch(error) {} // It can throw if the element failed to set up in the first place
		}
	})
</script>

<form on:submit={onSubmit}>
	<div bind:this={container} />
	{#if collectEmail && ready}
		<EmailField bind:value={email} bind:valid={emailValid} />
	{/if}
	<button disabled={!complete} type="submit" class="tipkit-btn">
		{label}
	</button>
</form>

