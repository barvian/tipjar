<script>
	export let value = 0
	export let floating
	export let autofocus = false
	export let readonly = false

	const formatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	})

	let input

	// Wish NumberFormat just exposed these directly:
	const parts = formatter.formatToParts(0)
	const [symbol, symbolIndex] = parts.reduce((c, p, i) => p.type === 'currency' ? [p.value, i] : c, null)
	const precision = Math.pow(10, parts.find(p => p.type === 'fraction')?.value?.length ?? 0)

	$: floating = value / precision
	$: textValue = formatter
		.formatToParts(floating)
		.filter(p => p.type !== 'currency')
		.map(p => p.value).join('')

	export function focus() {
		input?.focus()
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

<div class="wrapper {$$props.class}">
	<input type="text"
		bind:this={input}
		aria-label="Tip amount"
		autocomplete="off"
		placeholder="0.00"
		pattern="[0-9]*"
		value={textValue}
		on:keydown={handleKeyDown}
		on:click
		{readonly}
	/>
	<div class="filler" aria-hidden>
		{#if symbolIndex === 0}<span class="symbol">{symbol}</span>{/if}
		<span class="amount">{textValue}</span>
		<div class="caret" />
		{#if symbolIndex > 0}<span class="symbol">{symbol}</span>{/if}
	</div>
</div>

<style>
	.wrapper {
		position: relative;
	}

	input, .amount {
		background: none;
		border: none;
		display: block;
		font-size: calc(var(--font-size, 16px) * 3);
		font-family: inherit;
		font-weight: 300;
		line-height: 1;		
		padding: 0;
		text-align: center;
		white-space: nowrap;
	}

	input {
		caret-color: transparent;
		color: var(--black, black);
		width: 100%;
	}

		input:focus {
			outline: none;
		}

		/* iOS shows the caret sporadically when the keyboard isn't showing. No matter. */
		input:focus + .filler .caret {
			animation: blink-caret 1s -0.5s step-end infinite;
			display: block;
		}

	.filler {
		height: 100%;
		left: 50%;
		position: absolute;
		pointer-events: none;
		top: 0;
		transform: translateX(-50%);
	}

	@keyframes blink-caret {
	  from, to { opacity: 0; }
	  50% { opacity: 1; }
	}

	.caret {
		background: var(--black, black);
		display: none;
		height: 85%;
		margin-left: 0.1em;
		left: 100%;
		position: absolute;
		top: 7.5%;
		width: 1px;
	}

	.amount {
		opacity: 0;
		width: min-content;
	}

	.symbol {
		color: var(--gray, gray);
		position: absolute;
		top: 0.6em;
	}

		.symbol:first-child {
			margin-right: 0.1em;
			right: 100%;
		}

		.symbol:last-child {
			margin-left: calc(0.2em + 1px); /* leave room for caret */
			left: 100%;
		}
</style>