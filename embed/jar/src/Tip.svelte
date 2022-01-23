<script>
	import { onMount } from 'svelte'
	import MoneyInput from './MoneyInput.svelte'
	import Pay from './Pay/Pay.svelte'
	import { parseToHsla, hsla } from 'color2k'
	import { Frequency } from './lib/const'

	export let autofocus = true
	export let radius = ''
	export let label
	export let tipping
	export let createPaymentIntent
	export let getPaypalPlanId
	export let paypalClientId

	let didTip = false, leaving = false
	$: if (tipping) didTip = true
	$: leaving = !tipping && didTip

	let readonly = localStorage.getItem('tipkit-first-open') ?? true

	let select, input, selected = 'ONE_TIME', frequency, amount
	$: frequency = Frequency[selected]

	let paying
	$: disabled = paying

	onMount(() => {
		requestAnimationFrame(() => {
			readonly = false
			localStorage.setItem('tipkit-first-open', false)
		})
	})

	// Autofocus input
	$: if (tipping && autofocus && input) requestAnimationFrame(() => input.focus())
	// Fix a bug with focused readonly inputs in mobile Safari
	let clickedInput = false
	function handleInputClick(event) {
		if (clickedInput) return
		event.preventDefault()
		select.focus()
		input.focus()
		clickedInput = true
	}
</script>

<div class="tip"
	class:tipping class:leaving
	on:animationend={() => leaving = false}
	aria-hidden={!tipping}
	style="
		--radius: min({radius}, 9px);
	"
>
	{#if !paying}
	<div class="select">
		<select {disabled} id="frequency" bind:value={selected} bind:this={select}>
			<option value="ONE_TIME">{Frequency.ONE_TIME.label}</option>
			<optgroup label="Recurring (Manage/cancel via email receipts)">
				{#each Frequency.RECURRING as freq}
				<option value={freq[0]}>{freq[1].label}</option>
				{/each}
			</optgroup>
		</select>
		<label for="frequency">
			{frequency.label}
			<svg viewBox="0 0 9 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m1 1 3.5 3.5L8 1" stroke="currentColor" stroke-width="1.5"/></svg>
		</label>
	</div>
	<MoneyInput {disabled} bind:this={input} bind:value={amount} on:click={handleInputClick} {readonly} />
	{:else}
	<span>{amount}, {frequency.label}</span>
	{/if}
	<Pay {label} {amount} {frequency} {createPaymentIntent} {getPaypalPlanId} {paypalClientId} bind:paying />
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

	.tip {
		background: var(--bg);
		border-radius: var(--radius);
		box-shadow: 0 2px 20px rgba(0,0,0,0.03);
		bottom: calc(100% - calc(var(--size-1) - var(--size-0)));
		left: calc(var(--size-1) * -1);
		font-family: var(--font-family);
		padding: var(--size-1);
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
		--font-family: system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif;;
		--font-size: min(16px, 1rem); /* iOS tries zooming into inputs less than 16px */
		--size--1: calc(var(--font-size) * 0.75);
		--size-0: var(--font-size);
		--size-1: calc(var(--font-size) * 1.15);
	}

		.tip.tipping {
			animation: tip-appear 450ms cubic-bezier(0.33, 1, 0.68, 1) both;
			pointer-events: auto;
		}

		.tip.leaving {
			animation: tip-leave 250ms linear both;
		}


	input, select, label {
		font-family: var(--font-family);
		font-size: var(--font-size);
	}

	.tip :global(.tipkit-btn) {
		display: block;
		font-family: var(--font-family);
		font-size: var(--font-size);
		width: 100%;
	}

	.select {
		position: relative;
		width: min-content;
	}

		.select select {
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

		.select label {
			background: var(--bg);
			border-radius: 4px;
			color: var(--gray);
			display: block;
			font-weight: 600;
			pointer-events: none; /* click through */
			position: relative; /* position above */
			white-space: nowrap;
		}

		.select label svg {
			display: inline-block;
			position: relative;
			top: -0.1em;
			vertical-align: middle;
			width: 0.5em;
		}
</style>