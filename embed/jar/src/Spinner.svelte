<script>
	import { fade } from 'svelte/transition'

	export let hidden = false
	export let height
	export let color
</script>

{#if !hidden}
<div class="tipjar-spinner" class:has-height={!!height} style="
	height: {height ? height+'px' : 'auto'};
	--color: {color || 'currentColor'};
">
	<div class="lds-ring">
		<div></div><div></div><div></div><div></div>
	</div>
</div>
{/if}

<style>
	.tipjar-spinner {
		display: inline-block;
		vertical-align: middle;
	}

		.tipjar-spinner.has-height {
			align-items: center;
			display: flex;
			font-size: 1.25em;
			justify-content: center;
			width: 100%;
		}

	.lds-ring {
		display: block;
		height: 1em;
		width: 1em;
		position: relative;
	}

	.lds-ring div {
		box-sizing: border-box;
		display: block;
		position: absolute;
		top: 0;
		left: 0;
		width: 1em;
		height: 1em;
		border: 0.125em solid var(--color, currentColor);
		border-radius: 50%;
		animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
		border-color: var(--color, currentColor) transparent transparent transparent;
	}
	.lds-ring div:nth-child(1) {
		animation-delay: -0.45s;
	}
	.lds-ring div:nth-child(2) {
		animation-delay: -0.3s;
	}
	.lds-ring div:nth-child(3) {
		animation-delay: -0.15s;
	}
	@keyframes lds-ring {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

</style>