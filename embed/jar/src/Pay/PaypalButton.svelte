<script>
	import { loadScript } from '@paypal/paypal-js'
	import { Frequency } from '../lib/const'
	import { p } from '../lib/util'
	import Spinner from '../Spinner.svelte'

	export let currency
	export let floatingAmount
	export let hidden = false
	export let frequency
	export let height = 40
	export let pill = false
	export let paypalClientId
	export let error
	export let ready = false

	$: recurring = frequency !== Frequency.ONE_TIME

	let container, paypal
	function renderButtons() {
		p(paypalClientId).then(clientId => {
			const options = { 'client-id': clientId, components: 'buttons' }
			if (recurring) {
				options.vault = true
				options.intent = 'subscription'
			}
			return loadScript(options)
		}).then(paypal => {
			ready = false
			const handlers = {}
			if (recurring) {
				handlers.createSubscription = function() {

				}
			} else {
				handlers.createOrder = function(data, actions) {
					// Set up the transaction
						console.log(floatingAmount)

					return actions.order.create({
						purchase_units: [{
							amount: {
								currency_code: currency.toUpperCase(),
								value: floatingAmount
							}
						}]
					})
				}
			}
			paypal.Buttons({
				...handlers,
				onInit() {
					ready = true
				},
				onClick() {
					error = null
				},
				onError(err) {
					error = { paypalError: err }
				},
				style: {
					layout: 'horizontal',
					tagline: false,
					height,
					shape: pill ? 'pill' : 'rect',
					label: 'pay'
				}
			}).render(container)
		})
	}

	$: recurring, container && renderButtons()
</script>

<Spinner {height} hidden={ready || hidden} color="#ffc439" />
<div bind:this={container} class="paypal" style="height: {height}px; overflow: hidden" hidden={hidden || !ready} />
