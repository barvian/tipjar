<script>
	import { onMount } from 'svelte'
	import MoneyInput from './MoneyInput.svelte'

	export let autofocus = true
	let readonly = localStorage.getItem('tipkit-first-open') ?? true

	onMount(() => {
		requestAnimationFrame(() => {
			readonly = false
			localStorage.setItem('tipkit-first-open', false)
		})
	})
</script>

<div class="{$$props.class} tip">
	<select>
		<option>One-time</option>
		<optgroup label="Recurring (managed via email receipts)">
			<option>Weekly</option>
			<option>Bi-weekly</option>
			<option>Monthly (most popular)</option>
			<option>Quarterly</option>
			<option>Yearly</option>
		</optgroup>
	</select>
	<MoneyInput {autofocus} {readonly} />
</div>

<style>
	.tip {
		position: absolute;
	}
</style>