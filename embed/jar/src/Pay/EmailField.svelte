<script>
	export let value
	export let valid = false

	const validate = (event) => valid = event.target?.validity.valid
</script>

<label>
	Email (for receipt only)
	<input type="email" placeholder="Email" bind:value on:input={validate} />
</label>