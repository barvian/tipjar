<script>
	import { onMount } from 'svelte'
	import Money from './Money.svelte'
	import Pay from './Pay/Pay.svelte'
	import { parseToHsla, hsla } from 'color2k'
	import { Frequency } from './lib/const'
	import { crossfade, fade, fly } from 'svelte/transition'
	const [send, receive] = crossfade({ duration: 350 })

	export let autofocus = true
	export let r = 0
	export let label
	export let currency
	export let tipping
	export let createPaymentIntent
	export let getPaypalPlanId
	export let paypalClientId

	let height, didTip = false, leaving = false
	$: if (tipping) didTip = true
	$: leaving = !tipping && didTip

	let readonly = localStorage.getItem('tipkit-first-open') ?? true

	let select, selected = 'ONE_TIME', frequency, money, amount, floatingAmount
	$: frequency = Frequency[selected]

	let pay, paying, payExpanded

	onMount(() => {
		requestAnimationFrame(() => {
			readonly = false
			localStorage.setItem('tipkit-first-open', false)
		})
	})

	// Autofocus input
	$: if (tipping && autofocus && money) requestAnimationFrame(() => money.focus())
	// Fix a bug with focused readonly inputs in mobile Safari
	let clickedInput = false
	function handleInputClick(event) {
		if (clickedInput) return
		event.preventDefault()
		select.focus()
		money.focus()
		clickedInput = true
	}

	const buttonHeight = 40
	$: pill = r >= buttonHeight / 2
</script>

<div class="tipjar-tip"
	class:tipping class:leaving class:pill
	on:animationend={() => leaving = false}
	aria-hidden={!tipping}
	style="
		--radius: min({r}px, {pill ? '2.5em' : '9px'});
	"
>
	<div class="tipjar-tip-height" style="height: {height}px"><div class="tipjar-tip-wrapper" bind:clientHeight={height}>
		{#if !payExpanded}
		<div class="tipjar-tip-frequency-select" in:receive={{key: 'frequency'}} out:send={{key: 'frequency'}}>
			<select disabled={paying} id="frequency" bind:value={selected} bind:this={select}>
				<option value="ONE_TIME">{Frequency.ONE_TIME.label}</option>
				<optgroup label="Recurring (Manage/cancel via email receipts)">
					{#each Frequency.RECURRING as freq}
					<option value={freq[0]}>{freq[1].label}</option>
					{/each}
				</optgroup>
			</select>
			<label for="frequency">
				{frequency.label}
				<svg viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.193.97a.75.75 0 1 1 1.062 1.062L6.53 6.756a.75.75 0 0 1-1.06 0L.745 2.032A.75.75 0 1 1 1.807.97L6 5.163 10.193.97Z" fill="currentColor"/></svg>
			</label>
		</div>
		<Money class="tipjar-tip-money" {receive} {send} {currency} disabled={paying} bind:this={money} bind:amount bind:floatingAmount on:click={handleInputClick} {readonly} />
		{:else}
		<div class="tipjar-tip-header">
			<button transition:fly={{ x: -20 }} class="tipjar-tip-back" on:click={() => pay?.back()}>
				<svg viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.893 10.056a.75.75 0 1 1-1.062 1.062L1.107 6.393a.75.75 0 0 1 0-1.06L5.83.608A.751.751 0 0 1 6.893 1.67L2.7 5.863l4.193 4.193Z" fill="currentColor"/></svg>
			</button>
			<div class="tipjar-tip-summary">
				<Money {currency} {receive} {send} editable={false} amount={amount} /><!--
				--><span class="tipjar-tip-comma" transition:fade>, </span>
				<span class="tipjar-tip-frequency" in:receive={{key: 'frequency'}} out:send={{key: 'frequency'}}>
					{frequency.label.toLowerCase()}
				</span>
			</div>
		</div>
		{/if}
		<Pay {buttonHeight} {pill} {label} {currency} {amount} {floatingAmount} {frequency} {createPaymentIntent} {getPaypalPlanId} {paypalClientId} bind:this={pay} bind:paying bind:expanded={payExpanded} />
	</div></div>
</div>
	
<style>
	@keyframes tip-appear {
		from {
			filter: blur(2px);
			transform: rotateX(30deg) translateZ(-75px); /* not a hack, it has to be behind the jar */
		}

		25%, to {
			opacity: 1;
		}
	}

	@keyframes tip-leave {
		from {
			opacity: 1;
		}
		to {
			filter: blur(2px);
			opacity: 0;
			transform: translateY(-2rem);
		}
	}

	.tipjar-tip-height {
		display: flex;
		flex-flow: column nowrap;
		justify-content: flex-end;
		overflow: hidden;
		transition: height 250ms ease-in-out;
	}

		.tipjar-tip-height > * {
			width: 100%;
		}

	.tipjar-tip {
		background: var(--bg);
		border-radius: var(--radius);
		box-shadow: 0 2px 20px rgba(0,0,0,0.03);
		bottom: calc(100% - calc(var(--size-2) - var(--size-1)));
		right: calc(var(--size-1) * -1);
		font-size: var(--font-size);
		/*font-family: var(--font-family);*/
		min-width: 250px;
		position: absolute;
		opacity: 0;
		overflow: hidden;
		pointer-events: none;
		transform-origin: calc(var(--width) * 1px / 2 + var(--size-0)) 100%;

		--bg: #fff;
		--black: #000;
		--gray: #8E8E8E;
		/* https://css-tricks.com/snippets/css/system-font-stack/ */
		/*--font-family: system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif;;*/
		--font-size: min(16px, 1rem); /* iOS tries zooming into inputs less than 16px */
		--size--1: 0.75em;
		--size-0: 1em;
		--size-1: 1.15em;
		--size-2: 1.35em;
	}

		.tipjar-tip.tipping {
			animation: tip-appear 450ms cubic-bezier(0.33, 1, 0.68, 1) both;
			pointer-events: auto;
		}

		.tipjar-tip.leaving {
			animation: tip-leave 250ms linear both;
		}

	.tipjar-tip-wrapper {
		padding: var(--size-1) var(--size-1) var(--size-2);
	}

	input, select, label {
		font-family: var(--font-family);
		font-size: var(--font-size);
	}

	.tipjar-tip :global(.tipkit-btn) {
		display: block;
		font-family: var(--font-family);
		font-size: 1em;
		width: 100%;
	}

	.tipjar-tip-frequency-select {
		left: 0.25em;
		margin: 0 auto 0.35em;
		position: relative;
		width: min-content;
	}

		.tipjar-tip-frequency-select select {
			background: none;
			box-shadow: none;
			border: none;
			border-radius: 4px;
			appearance: none;
			position: absolute;
			left: 0;
			top: 0;
			height: 100%;
			width: 100%;
		}

		.tipjar-tip-frequency-select label {
			background: var(--bg);
			border-radius: 4px;
			color: var(--gray);
			display: block;
			font-weight: 600;
			pointer-events: none; /* click through */
			position: relative; /* position above */
			white-space: nowrap;
		}

		.tipjar-tip-frequency-select label svg {
			display: inline-block;
			position: relative;
			top: -0.1em;
			vertical-align: middle;
			width: 0.75em;
		}

	/*.tipjar-tip :global(.tipjar-tip-money) {
		margin-bottom: var(--size--1);
	}*/

	/*.tipjar-tip :global(.tipkit-money.editable .tipkit-money-text::after) {
		content: '';
		flex-basis: 0.5em;
		flex-shrink: 1;
		flex-grow: 0;
	}*/

	.tipjar-tip-header {
		align-items: center;
		display: flex;
		justify-content: flex-start;
	}

	.tipjar-tip-summary {
		flex: 1;
		padding-top: 0.1em;
		text-align: center;
	}

	.tipjar-tip-back {
		align-items: center;
		background: none;
		color: var(--black);
		appearance: none;
		display: inline-flex;
		border-radius: 100%;
		border: 1px solid rgba(0,0,0,0.1);
		box-shadow: none;
		height: 1.5em;
		justify-content: center;
		margin-right: 0.35em;
		padding: 0;
		width: 1.5em;
	}

		.tipjar-tip-header::after {
			content: '';
			flex-basis: 1.85em; /* button width + margin */
			flex-shrink: 1;
			flex-grow: 0;
		}

	.tipjar-tip-summary svg {
		height: 0.75em;
		position: relative;
		vertical-align: middle;
	}

		.tipjar-tip.pill .tipjar-tip-summary {
			padding-left: 4px;
		}

	.tipjar-tip-frequency {
		display: inline-block; /* can't animate inline elements */
	}
</style>