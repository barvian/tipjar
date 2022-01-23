<script>
	import { onMount } from 'svelte'

	export let value
	export let valid = false

	let field
	const validate = () => valid = field?.validity.valid

	onMount(validate)
</script>

<input type="email" placeholder="Email (for receipts only)" bind:value on:change={validate} />