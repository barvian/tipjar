<script>
  import { onMount } from 'svelte'
  import Coins from './Coins.svelte'
  import Tip from './Tip.svelte'

  export let radius = 60
  export let bg = 'rgba(255, 255, 255, 0.9)'
  export let label = 'Tips'
  export let labelFontFamily = "sans-serif"
  export let labelFontWeight = 600
  export let labelFontSize = '1rem'
  export let labelColor = '#000'
  export let labelLetterSpacing = 0
  export let labelTextTransform = 'none'

  let tipping = false

  let w, h, r, holeSpace
  $: r = h ? Math.min(h / 2, radius) : radius // compute actual radius, i.e. if 999px
  $: holeSpace = w ? w - r*2 : 0

  let jar, coins
  onMount(() => {
    // Add class to page upon dragging
    document.addEventListener('dragover', onDocumentDrag, false) // prevent opening file
    document.addEventListener('dragenter', onDocumentDrag, false)
    document.addEventListener('dragleave', onDocumentDragEnd, false)
    document.addEventListener('drop', onDocumentDragEnd, false) // prevent opening file

    return () => {
      document.removeEventListener('dragover', onDocumentDrag)
      document.removeEventListener('dragenter', onDocumentDrag)
      document.removeEventListener('dragleave', onDocumentDragEnd)
      document.removeEventListener('drop', onDocumentDragEnd)
    }
  })

  function onDocumentDrag(event) {
    event.preventDefault()
    document.documentElement.classList.add('is-dragover')
  }

  function onDocumentDragEnd(event) {
    document.documentElement.classList.remove('is-dragover')
    if (event.type === 'drop' && event.target === jar || jar?.contains(event.target)) return // let it propagate down
    event.preventDefault() // disable browser's default
  }

  function onDrop(event) {
    event.preventDefault()
    const text = event.dataTransfer?.getData('text')
    if (text && coins) coins.addNote()
  }

  // Apparently necessary to allow the drop:
  // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop#prevent_the_browsers_default_drag_behavior
  function onDragOver(event) {
    event.preventDefault()
  }
</script>

<div class="wrapper">
  <div class="jar"
    bind:clientWidth={w} bind:clientHeight={h}
    bind:this={jar}
    tabindex="0" role="button"
    on:click={() => tipping = !tipping}
    on:drop={onDrop} on:dragover={onDragOver}
    aria-expanded={tipping} aria-controls="tip"
    style="
      --radius: {radius};
      --bg: {bg};
      --label-color: {labelColor};
      --label-font-family: {labelFontFamily};
      --label-font-weight: {labelFontWeight};
      --label-font-size: {labelFontSize};
      --label-letter-spacing: {labelLetterSpacing};
      --label-text-transform: {labelTextTransform};
      --hole-space: {holeSpace};
    "
  >
    <div class="shadow"></div>
    <div class="base">
      {#if w && h && radius != null}
      <Coins {w} {h} {radius} paused={tipping} bind:this={coins} />
      {/if}
    </div>
    <span>{label}</span>
    <div class="opening"></div>
  </div>
  
  {#if tipping}
  <Tip />
  {/if}
</div>

<style> 
  *, *::before, *::after {
    box-sizing: content-box;
    padding: 0;
    margin: 0;
  }

  .wrapper {
    position: relative; /* todo: param for this; */
    perspective: 800px;
    width: min-content;
  }

  .jar {
    align-items: center;
    display: flex;
    justify-content: center;
    color: var(--label-color);
    font-size: var(--label-font-size);
    font-weight: var(--label-font-weight);
    font-family: var(--label-font-family);
    letter-spacing: var(--label-letter-spacing);
    text-transform: var(--label-text-transform);
    width: 76px;
    height: 66px;
    transform-origin: 50% 300%;
    transform-style: preserve-3d;
    transition: transform var(--transition);
    will-change: transform;
    cursor: pointer;
    user-select: none;

    --transition: 250ms ease-out;
    --min-hole: calc(var(--hole-space) + 20); /* kinda magic number */
    --hole: min(var(--min-hole), 32);
  }

  .base {
    /*backdrop-filter: blur(4px); this kills it in Chrome*/
    background: var(--bg);
    border-radius: calc(var(--radius) * 1px);
    position: absolute;
    overflow: hidden;
    top: 0;
    transition: transform var(--transition);
    transform: translateZ(-24px) scale(1.035); /* scale visually undoes Z translation */
    transform-origin: center;
    left: 0;
    width: 100%;
    height: 100%;
  }

    .jar:hover .base,
    :global(.is-dragover) .jar .base {
      /* compensate for the lack of actual 3d by scaling upward too */
      transform: translateZ(-33px) scale(1.035, 1.085) translateY(5%);
    }

  /*
   * Layer for more realistic effect
   * See:  https://tobiasahlin.com/blog/layered-smooth-box-shadows/
   */
  .shadow {
    box-shadow:
      0 2px 6px -1px rgba(0, 0, 0, 0.03),
      0 4px 12px -4px rgba(0, 0, 0, 0.05),
      0 8px 20px -4px rgba(0, 0, 0, 0.07)
    ;
    border-radius: calc(var(--radius) * 1px);
    position: absolute;
    top: 0;
    transition: filter var(--transition), transform var(--transition);
    transform: translateZ(-40px);
    transform-origin: center;
    left: 0;
    width: 100%;
    height: 100%;
  }

    .jar:hover .shadow,
    :global(.is-dragover) .jar .shadow {
      filter: blur(1px);
      /* compensate for the lack of actual 3d */
      transform: translateZ(-40px) translateY(12%);
    }

  .jar:hover, :global(.is-dragover) .jar {
    transform: rotateX(-15deg);
  }

  .opening {
    position: absolute;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 100%;
    box-shadow: 0 1px 1px rgba(255, 255, 255, 0.15);
    transform: translate3d(-50%, 3px, -24px) rotateX(90deg) scaleX(clamp(0.1, var(--min-hole) / var(--hole), 1)); /* scale helps the transition just a tad */
    transition: transform var(--transition);
    transform-origin: 50% 0%;
    backface-visibility: hidden;
    left: 50%;
    top: 0;
    width: calc(var(--hole)*1px);
    height: calc(var(--hole)*1px);
  }

  .jar:hover .opening,
  :global(.is-dragover) .jar .opening {
    transform: translate3d(-50%, 0, -24px) rotateX(90deg);
  }
</style>