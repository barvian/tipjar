<script>
	import { onMount } from 'svelte'

	export let valid = false

	let field
	validate = () => valid = field?.validity.valid

	onMount(validate)
</script>

<input type="email" placeholder="Email (for receipts only)" bind:this={field} on:change={validate} />