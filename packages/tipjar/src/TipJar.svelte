<script>
  import { onMount, setContext } from 'svelte'
  import { loadStripe } from '@stripe/stripe-js'
  import { loadScript as loadPaypal } from '@paypal/paypal-js'
  import Coins, { loadMatter } from './Coins.svelte'
  import { darken, parseToHsla } from 'color2k'
  import Tip from './Tip.svelte'
  import { stripeKey, paypalKey } from './const'

  export let radius = '60em'
  export let color = 'rgba(255, 255, 255, 0.9)'
  export let label = 'Give'
  export let labelFontFamily = "sans-serif"
  export let labelFontWeight = 600
  export let labelFontSize = '1rem'
  export let labelColor = '#000'
  export let labelLetterSpacing = 0
  export let labelTextTransform = 'none'

  export let stripePublishableKey = ''
  export let paypalClientId = ''

  let jar, coins, base
  let tipping = false
  const matterReq = loadMatter()

  let w, h, r, c, shadowHsl
  $: if (base) { // compute actual radius in px
    const radiusPx = getComputedStyle(base).getPropertyValue('border-radius')
    const int = parseInt(radiusPx, 10)
    r = h ? Math.min(h / 2, int) : int
  }
  $: c = base && getComputedStyle(base).getPropertyValue('background-color') // in case they passed in a variable
  $: if (c) { // Generate shadow hsl parts
    const hsla = parseToHsla(c)
    shadowHsl = `${hsla[0]},${hsla[1]*100}%,15%`
  }
  
  setContext(stripeKey, loadStripe(stripePublishableKey))
  setContext(paypalKey, loadPaypal({ 'client-id': paypalClientId }))

  onMount(() => {
    document.addEventListener('click', onDocumentClick, false)
    // Add class to page upon dragging
    document.addEventListener('dragover', onDocumentDrag, false) // prevent opening file
    document.addEventListener('dragenter', onDocumentDrag, false)
    document.addEventListener('dragleave', onDocumentDragEnd, false)
    document.addEventListener('drop', onDocumentDragEnd, false) // prevent opening file

    return () => {
      document.removeEventListener('click', onDocumentClick)
      document.removeEventListener('dragover', onDocumentDrag)
      document.removeEventListener('dragenter', onDocumentDrag)
      document.removeEventListener('dragleave', onDocumentDragEnd)
      document.removeEventListener('drop', onDocumentDragEnd)
    }
  })

  let wrapper
  function onDocumentClick(event) {
    if (tipping && wrapper && !wrapper.contains(event.target)) tipping = false
  }

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

<div class="wrapper" bind:this={wrapper} style="
  --height: {h};
  --width: {w};
  --radius: {radius};
  --shadow-hsl: {shadowHsl ?? '0,0%,0%'};
">
  <div class="jar" class:tipping
    bind:clientWidth={w} bind:clientHeight={h}
    bind:this={jar}
    role="button"
    on:click={() => tipping = !tipping}
    on:drop={onDrop} on:dragover={onDragOver}
    aria-expanded={tipping} aria-controls="tip"
    style="
      --color: {color};
      --label-color: {labelColor};
      --label-font-family: {labelFontFamily};
      --label-font-weight: {labelFontWeight};
      --label-font-size: {labelFontSize};
      --label-letter-spacing: {labelLetterSpacing};
      --label-text-transform: {labelTextTransform};
      --hole-space: {w ? w - r*2 + 10: 0};
    "
  >
    <div class="shadow"></div>
    <div class="base" bind:this={base}>
      {#await matterReq then matter}
        {#if w && h && c && r != null}
        <Coins {w} {h} {r} {c} paused={tipping} {matter} bind:this={coins} />
        {/if}
      {/await}
    </div>
    <span>{label}</span>
    <div class="opening"></div>
  </div>
  
  <Tip {tipping} />
</div>

<style>
  .wrapper {
    position: relative; /* todo: param for this; */
    perspective: 800px;
    width: min-content;

    --shadow: 
      0 2px 6px -1px hsla(var(--shadow-hsl), 0.03),
      0 4px 12px -4px hsla(var(--shadow-hsl), 0.05),
      0 8px 20px -4px hsla(var(--shadow-hsl), 0.07)
    ;
  }

    .wrapper :global(*), .wrapper :global(*::before), .wrapper :global(*::after) {
      box-sizing: border-box;
      padding: 0;
      margin: 0;
    }

    .wrapper :global([hidden]) {
      display: none !important;
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
    line-height: 1;
    text-shadow: 0 1px 1px var(--color);
    text-transform: var(--label-text-transform);
    transform-origin: 50% 300%;
    transform-style: preserve-3d;
    transition: filter var(--transition), transform var(--transition);
    width: 76px;
    height: 66px;
    will-change: transform;
    cursor: pointer;
    user-select: none;

    --open-transform: rotateX(-15deg);
    --transition: 250ms ease-out;
    --hole: clamp(24, var(--hole-space), 32);
  }

    :global(.is-dragover:root) .jar {
      transform: var(--open-transform);
    }
    @media (hover:  hover) {
      .jar:not(.tipping):hover {
        transform: var(--open-transform);
      }

      .jar:not(.tipping):active {
        transform: var(--open-transform) translateY(2px);
        transition-duration: 50ms;
      }
    }

  .base {
    /*backdrop-filter: blur(4px); this kills it in Chrome*/
    background-color: var(--color);
    border-radius: var(--radius);
    position: absolute;
    overflow: hidden;
    top: 0;
    transition: transform var(--transition);
    transform: translateZ(-24px) scale(1.035); /* scale visually undoes Z translation */
    transform-origin: center;
    left: 0;
    width: 100%;
    height: 100%;

    /* compensate for the lack of actual 3d by scaling upward too */
    --open-transform: translateZ(-24px) scale(1.035, 1.085) translateY(5%);
  }

    @media (hover: hover) {
      .jar:not(.tipping):hover .base {
        transform: var(--open-transform);
      }
    }
    :global(.is-dragover:root) .jar .base {
      transform: var(--open-transform);
    }

    /* Border to maintain contrast despite coins */
    .base::after {
      box-shadow: inset 0 0 0/*3px TODO turn this on via glassiness*/ 1px var(--color);
      border-radius: var(--radius);
      content: '';
      opacity: 0.8;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
    }

  /*
   * Layer for more realistic effect
   * See:  https://tobiasahlin.com/blog/layered-smooth-box-shadows/
   */
  .shadow {
    box-shadow: var(--shadow);
    border-radius: var(--radius);
    position: absolute;
    top: 0;
    transition: filter var(--transition), transform var(--transition);
    transform: translateZ(-40px);
    transform-origin: center;
    left: 0;
    width: 100%;
    height: 100%;

    --open-filter: blur(1px);
    /* compensate for the lack of actual 3d */
    --open-transform: translateZ(-40px) translateY(12%);;
  }

    @media (hover: hover) {
      .jar:not(.tipping):hover .shadow {
        filter: var(--open-filter);
        transform: var(--open-transform);
      }
    }
    :global(.is-dragover:root) .jar .shadow {
      filter: var(--open-filter);
      transform: var(--open-transform);
    }

  .opening {
    position: absolute;
    background: linear-gradient(to bottom, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.12) 130%);
    border-radius: 100%;
    box-shadow: 0 1px 1px rgba(255, 255, 255, 0.15);
    transform: translate3d(-50%, 1px, -24px) rotateX(90deg) scaleX(clamp(0.1, var(--hole-space) / var(--hole), 1)); /* help the transition in case the hole is bigger than what's visually allowed */
    transition: transform var(--transition);
    transform-origin: 50% 0%;
    backface-visibility: hidden;
    left: 50%;
    top: 0;
    width: calc(var(--hole)*1px);
    height: calc(var(--hole)*1px);

    --open-transform: translate3d(-50%, 1px, -24px) rotateX(90deg);
  }

  @media (hover:  hover) {
    .jar:not(.tipping):hover .opening {
      transform: var(--open-transform);
    }
  }
  :global(.is-dragover:root) .jar .opening {
    transform: var(--open-transform);
  }
</style>