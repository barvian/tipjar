<script>
	export let amount = 0
	export let currency
	export let floatingAmount
	export let value
	export let formatted
	export let editable = true
	export let autofocus = false
	export let disabled = false
	export let readonly = false

	export let send
	export let receive

	const formatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency.toUpperCase()
	})

	let input

	// Wish NumberFormat just exposed these directly:
	const parts = formatter.formatToParts(0)
	const [symbol, symbolIndex] = parts.reduce((c, p, i) => p.type === 'currency' ? [p.value, i] : c, null)
	const precision = Math.pow(10, parts.find(p => p.type === 'fraction')?.value?.length ?? 0)

	$: floatingAmount = amount / precision
	$: value = formatter.format(floatingAmount)
	$: withoutSymbol = formatter
		.formatToParts(floatingAmount)
		.filter(p => p.type !== 'currency')
		.map(p => p.value).join('')

	export function focus() {
		input?.focus()
	}

	function handleKeyDown(event) {
		const str = amount.toString(10)
		if (event.code === "Backspace") {
			amount = str.length <= 1 ? 0 :parseInt(str.substring(0, str.length-1), 10)
		} else if (/^Digit[0-9]$/.test(event.code)) {
			amount = parseInt(str+event.key, 10)
		}

		event.preventDefault()
		return false // prevent character from appearing (doesn't seem to do much)
	}
</script>

<div class="tipkit-money {$$props.class}" class:editable>
	{#if editable}
	<input type="text"
		bind:this={input}
		aria-label="Tip amount"
		autocomplete="off"
		placeholder="0.00"
		pattern="[0-9]*"
		value={withoutSymbol}
		on:keydown={handleKeyDown}
		on:click
		{disabled}
		{readonly}
	/>
	{/if}
	<div class="tipkit-money-text" aria-hidden={editable}>
		{#if symbolIndex === 0}<span class="tipkit-money-symbol" in:receive={{key:'symbol'}} out:send={{key:'symbol'}}>{symbol}</span>{/if}<!--
		--><span class="tipkit-money-amount" in:receive={{key:'amount'}} out:send={{key:'amount'}}>{withoutSymbol}</span><!--
		-->{#if editable}<div class="tipkit-money-caret" />{/if}<!--
		-->{#if symbolIndex > 0}<span class="tipkit-money-symbol" in:receive={{key:'symbol'}} out:send={{key:'symbol'}}>{symbol}</span>{/if}
	</div>
</div>

<style>
	.tipkit-money {
		position: relative;
	}

		.tipkit-money:not(.editable) {
			display: inline-block;
		}

	.tipkit-money.editable .tipkit-money-amount {
		font-size: calc(var(--font-size, 16px) * 3);
		font-family: inherit;
		font-weight: 300;
		line-height: 1;
		padding: 0;
		text-align: center;
		white-space: nowrap;
	}

	input {
		color: var(--black, black);
		position: absolute;
		font-size: 16px;
		left: 0;
		opacity: 0;
		height: 100%;
		top: 0;
		width: 100%;
	}

		input:focus {
			outline: none;
		}

		/* iOS shows the caret sporadically when the keyboard isn't showing. No matter. */
		input:not(:focus) + .tipkit-money-text .tipkit-money-caret {
			visibility: hidden;
		}

		input:focus + .tipkit-money-text .tipkit-money-caret {
			animation: blink-caret 1s -0.5s step-end infinite;
		}

	.tipkit-money.editable .tipkit-money-text {
		align-items: flex-start;
		display: flex;
		justify-content: center;
		pointer-events: none;
		position: relative;
	}

	@keyframes blink-caret {
	  from, to { opacity: 0; }
	  50% { opacity: 1; }
	}

	.tipkit-money-caret {
		align-self: stretch;
		background: var(--black, black);
		/*height: 100%;*/
		margin-left: 0.1em;
		width: 1px;
	}

	.tipkit-money-amount, .tipkit-money-symbol { /* can't apply transitions to inline elements */
		display: inline-block;
	}

	.tipkit-money.editable .tipkit-money-symbol {
		color: var(--gray, gray);
		margin-top: 0.4em;
	}

		.tipkit-money.editable .tipkit-money-symbol:first-child {
			margin-right: 0.1em;
			right: 100%;
		}

		.tipkit-money.editable .tipkit-money-symbol:last-child {
			margin-left: calc(0.2em + 1px); /* leave room for caret */
			left: 100%;
		}
</style>