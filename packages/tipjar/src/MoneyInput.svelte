<script>
	export let value = 0
	export let autofocus = false
	export let readonly = false

	const formatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	})

	// Wish NumberFormat just exposed these directly:
	const parts = formatter.formatToParts(0)
	const [symbol, symbolIndex] = parts.reduce((c, p, i) => p.type === 'currency' ? [p.value, i] : c, null)
	const precision = Math.pow(10, parts.find(p => p.type === 'fraction')?.value?.length ?? 0)

	$: textValue = formatter
		.formatToParts(value / precision)
		.filter(p => p.type !== 'currency')
		.map(p => p.value).join('')

	function autoFocus(el) {
		if (autofocus) el.focus()
	}

	function handleKeyDown(event) {
		const str = value.toString(10)
		if (event.code === "Backspace") {
			value = str.length <= 1 ? 0 :parseInt(str.substring(0, str.length-1), 10)
		} else if (/^Digit[0-9]$/.test(event.code)) {
			value = parseInt(str+event.key, 10)
		}

		event.preventDefault()
		return false // prevent character from appearing (doesn't seem to do much)
	}
</script>

{#if symbolIndex === 0}{symbol}{/if}
<input type="text"
	aria-label="Tip amount"
	autocomplete="off"
	placeholder="0.00"
	pattern="[0-9]*"
	value={textValue}
	on:keydown={handleKeyDown}
	use:autoFocus {readonly}
/>
{#if symbolIndex > 0}{symbol}{/if}

<style>
</style>