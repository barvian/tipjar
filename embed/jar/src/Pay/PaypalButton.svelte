<script>
	import { loadScript } from '@paypal/paypal-js'
	import { Frequency } from '../lib/const'
	import { p } from '../lib/util'

	export let hidden = false
	export let frequency
	export let height = 40
	export let paypalClientId

	let paypal
	$: paypal = p(paypalClientId).then(clientId => {
		const options = { 'client-id': clientId, components: 'buttons' }
		if (frequency !== Frequency.ONE_TIME) {
			options.vault = true
			options.intent = 'subscription'
		}
		return loadScript(options)
	})

	let container
	async function renderButtons() {
		(await paypal).Buttons({
			style: {
				layout: 'horizontal',
				tagline: false,
				height,
				shape: 'rect',
				label: 'pay'
			}
		}).render(container)
	}

	$: paypal && container && renderButtons()
</script>

<div bind:this={container} class="paypal" {hidden}></div>
