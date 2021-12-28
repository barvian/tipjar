<script>
	import { onMount } from 'svelte'
	import MoneyInput from './MoneyInput.svelte'
	import PaymentMethod from './PaymentMethod.svelte'
	import { Frequency } from './const'

	export let autofocus = true
	export let tipping

	let didTip = false, leaving = false
	$: if (tipping) didTip = true
	$: leaving = !tipping && didTip

	let readonly = localStorage.getItem('tipkit-first-open') ?? true

	let select, input, selected = 'ONE_TIME', frequency, amount
	$: frequency = Frequency[selected]

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

<div class="tip" class:tipping class:leaving on:animationend={() => leaving = false} aria-hidden={!tipping}>
	<form novalidate>
		<div class="select">
			<select id="frequency" bind:value={selected} bind:this={select}>
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
		<MoneyInput bind:this={input} bind:value={amount} on:click={handleInputClick} {readonly} />
		<PaymentMethod {amount} />
	</form>
</div>

<style>
	@keyframes come-in {
		from {
			filter: blur(5px);
			opacity: 1;
			transform: rotateX(-25deg);
		}

		to {
			opacity: 1;
		}
	}

	@keyframes leave {
		from {
			opacity: 1;
		}

		to {
			filter: blur(5px);
			opacity: 0;
			transform: translateY(-2rem);
		}
	}

	.tip {
		background: #fff;
		border-radius: min(var(--radius), 9px);
		box-shadow: var(--shadow);
		bottom: calc(100% + 12px + var(--height, 0) * .035px);
		/* https://css-tricks.com/snippets/css/system-font-stack/ */
		font-family: var(--font-family);
		padding: var(--size-0);
		min-width: 250px;
		position: absolute;
		opacity: 0;
		overflow: hidden;
		pointer-events: none;
		transform-origin: 50% calc(100% + var(--height, 0) * 3px);

		--black: #000;
		--gray: #8E8E8E;
		--font-family: system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif;;
		--font-size: min(16px, 1rem); /* iOS tries zooming into inputs less than 16px */
		--size--1: calc(var(--font-size) * 0.75);
		--size-0: var(--font-size);
		--size-1: calc(var(--font-size) * 1.15);
	}

		.tip.tipping {
			animation: come-in 0.35s cubic-bezier(0.33, 1, 0.68, 1) both;
			pointer-events: auto;
		}

		.tip.leaving {
			animation: leave 0.35s cubic-bezier(0.33, 1, 0.68, 1) both;
		}

	input, select, label {
		font-family: var(--font-family);
		font-size: var(--font-size);
	}

	.tip :global(.tip-button) {
		display: block;
		font-family: var(--font-family);
		font-size: var(--font-size);
	}

	.tip :global(.methods) {
		margin-top: var(--size--1);
	}

	form {
		display: flex;
		flex-flow: column nowrap;
		align-items: center;
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
			background: #fff;
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