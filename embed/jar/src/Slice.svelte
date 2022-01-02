<script>
	export let z = 0
	export let w = 0
	export let h = 0
	export let r = 0
	export let d = 0
	export let el

	let zR, straightX, straightY, triangleHeight, triangleWidth
	$: zR = Math.min(r, d / 2)
	$: straightX = w - zR*2
	$: straightY = h - zR*2
	$: triangleHeight = Math.max(0, z - (d / 2 - zR))
	$: triangleWidth = Math.sqrt(zR*zR - triangleHeight*triangleHeight)
	$: console.log(z, (straightX + triangleWidth*2) / w, (straightY + triangleWidth*2) / h)
</script>

<div class="slice {$$props.class || ''}"
	bind:this={el}
	style="
		--scaleX: {(straightX + triangleWidth*2) / w};
		--scaleY: {(straightY + triangleWidth*2) / h};
		--z: {z}px;
	"
>
	<slot />
</div>

<style>
	.slice {
		background-color: var(--color);
	    border-radius: var(--radius);
	    position: absolute;
	    top: 0;
	    transform:
		    translateZ(calc(var(--depth)*1px / -2 - var(--z)))
		    scale(calc(var(--upscale) * var(--scaleX)), calc(var(--upscale) * var(--scaleY)))
	    ;
	    transform-origin: center;
	    left: 0;
	    width: 100%;
	    height: 100%;

	    /* scale visually undoes translateZ to keep things pixel-aligned with the rest of the page */
	    --upscale: calc(1);
	}
</style>