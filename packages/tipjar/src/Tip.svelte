<script>
	import { onMount } from 'svelte'
	import MoneyInput from './MoneyInput.svelte'
	import PaymentMethod from './PaymentMethod.svelte'
	import { Frequency } from './const'

	export let autofocus = true
	export let radius = 12

	let readonly = localStorage.getItem('tipkit-first-open') ?? true

	let select, input, selected = 'ONE_TIME', frequency, amount
	$: frequency = Frequency[selected]

	onMount(() => {
		requestAnimationFrame(() => {
			readonly = false
			localStorage.setItem('tipkit-first-open', false)
		})
	})

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

<div class="{$$props.class} tip"
	style="--radius: min(9px, {radius}*1px);"
>
	<form>
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
		<MoneyInput bind:this={input} bind:value={amount} on:click={handleInputClick} {autofocus} {readonly} />
		<PaymentMethod {amount} />
	</form>
</div>

<style>
	.tip {
		background: #fff;
		border-radius: var(--radius);
		/* https://css-tricks.com/snippets/css/system-font-stack/ */
		font-family: system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif;
		padding: var(--size-1) var(--size-0);
		min-width: 250px;
		position: absolute;
		overflow: hidden;

		--black: #000;
		--gray: #8E8E8E;
		--font-size: min(16px, 1rem); /* iOS tries zooming into inputs less than 16px */
		--size-0: var(--font-size);
		--size-1: calc(var(--font-size) * 1.15);
	}

	input, select, label {
		font-family: inherit;
		font-size: var(--font-size);
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