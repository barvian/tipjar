<script>
	import { onMount, getContext } from 'svelte'
	import { stripeKey } from '../lib/const'

	export let clientSecret
	export let label = 'Pay'
	export let email
	let collectEmail = !!email

	const stripeReq = getContext(stripeKey)

	let container, elements, element

	let elementComplete = false, emailValid
	$: complete = elementComplete && emailValid

	async function renderElement() {
		const stripe = await stripeReq
		elements = stripe.elements({
			clientSecret,
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
			      email
			    }
			}
		})

		element.mount(container)
		element.on('change', onChange)
	}

	function onChange(event) {
		complete = event.complete
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

<form on:submit={onSubmit}>
	<div bind:this={container} />
	{#if collectEmail}
		<EmailField bind:value={email} bind:valid={emailValid} />
	{/if}
	<button disabled={!complete} type="submit" class="tipkit-btn">
		{label}
	</button>
</form>

