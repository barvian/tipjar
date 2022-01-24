<script>
	import { loadScript } from '@paypal/paypal-js'
	import { Frequency } from '../lib/const'
	import { p } from '../lib/util'

	export let currency
	export let floatingAmount
	export let hidden = false
	export let frequency
	export let height = 40
	export let paypalClientId
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
			}
			paypal.Buttons({
				...handlers,
				onInit() {
					ready = true
				},
				style: {
					layout: 'horizontal',
					tagline: false,
					height,
					shape: 'rect',
					label: 'pay'
				}
			}).render(container)
		})
	}

	$: recurring, renderButtons()
</script>

<div bind:this={container} class="paypal" style="height: {height}px; overflow: hidden" hidden={hidden || !ready} />
{#if !ready && !hidden}<div class="tipkit-paypal-loading" style="height: {height}px">loading</div>{/if}