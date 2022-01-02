<script>
  import { onMount, setContext } from 'svelte'
  import { loadStripe } from '@stripe/stripe-js'
  import { loadScript as loadPaypal } from '@paypal/paypal-js'
  import Tip from './Tip.svelte'
  import Slice from './Slice.svelte'
  import Coins, { loadMatter } from './Coins.svelte'
  import { parseToHsla } from 'color2k'
  import { isInView } from './lib/util'
  import { stripeKey, paypalKey } from './lib/const'

  export let radius = '60rem'
  export let color = '#fff' // TODO: strip alpha from this because it'll mess with back elements
  export let label = 'Donate'
  export let labelFontFamily = "sans-serif"
  export let labelFontWeight = 600
  export let labelFontSize = '1rem'
  export let labelColor = '#000'
  export let labelLetterSpacing = 0
  export let labelTextTransform = 'none'
  export let popupRadius
  
  export let stripePublishableKey
  export let paypalClientId

  let jar, coins, base
  let tipping = false

  let w, h, r, c, d
  $: if (base) { // compute actual radius in px
    const radiusPx = getComputedStyle(base).getPropertyValue('border-radius')
    const int = parseInt(radiusPx, 10)
    r = h ? Math.min(h / 2, int) : int
  }
  $: if (base) {
     // in case they passed in a variable:
    const computed = getComputedStyle(base).getPropertyValue('background-color')
    c = parseToHsla(computed)
  }
  $: d = h

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
  --radius: {r != null ? `${r}px` : radius};
  --color-hue: {c ? c[0] : 0};
  --color-saturation: {c ? c[1]*100 : 0}%;
  --color-lightness: {c ? c[2]*100 : 0}%;
">
  <Tip {tipping} radius={popupRadius || `${r}px`} />

  <div class="jar" class:tipping
    bind:clientWidth={w} bind:clientHeight={h}
    bind:this={jar}
    role="button"
    on:click={() => tipping = !tipping}
    on:drop={onDrop} on:dragover={onDragOver}
    aria-expanded={tipping} aria-controls="tip"
    style="
      --color: {color};
      --depth: {d};
      --label-color: {labelColor};
      --label-font-family: {labelFontFamily};
      --label-font-weight: {labelFontWeight};
      --label-font-size: {labelFontSize};
      --label-letter-spacing: {labelLetterSpacing};
      --label-text-transform: {labelTextTransform};
      --hole-space: {w ? w - r*2 + 10: 0};
    "
  >
    <div class="shadow" />
    {#if d}
      {#each Array(d / 4) as _, i}
        <Slice {r} {w} {h} {d} z={d/2 - i*  2} />
      {/each}
    {/if}
    <Slice {r} {w} {h} {d} class="base" bind:el={base}>
      {#await loadMatter() then matter}
        {#if w && h && c && jar && r != null}
        <Coins {w} {h} {r} {c} paused={tipping} {matter}, inView={isInView(jar)} bind:this={coins} />
        {/if}
      {/await}
    </Slice>
    <span>{label}</span>
    <div class="opening"></div>
  </div>
</div>

<style>
  .wrapper {
    position: relative; /* todo: param for this; */
    perspective: calc(var(--perspective) * 1px);
    width: min-content;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    --color: hsl(var(--color-hue), var(--color-saturation), var(--color-lightness));
    --perspective: 800;
    --transition-duration: 250ms;
    --transition-timing-function: /*cubic-bezier(0.33, 1, 0.68, 1)*/ease-out;
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
    min-width: calc(var(--height, 0) * 1.1px);
    padding: 1.5em 1.25em;
    text-shadow: 0 1px 1px var(--color);
    text-transform: var(--label-text-transform);
    transform-origin: 50% 300%;
    transform-style: preserve-3d;
    transition-property: filter, transform;
    transition-duration: var(--transition-duration);
    transition-timing-function: var(--transition-timing-function);
    /*width: 76px;*/
    /*height: 66px;*/
    will-change: transform;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;

    --open-transform: rotateX(-15deg);
    --hole: clamp(16, var(--hole-space), 24);
  }

    .jar.tipping, :global(.is-dragover:root) .jar {
      transform: var(--open-transform);
    }
    .jar.tipping :global(.base), :global(.is-dragover:root) .jar :global(.base) {
      --shade-size: var(--open-shade-size);
    }
    @media (hover:  hover) {
      .jar:hover {
        transform: var(--open-transform);
      }

        .jar:hover :global(.base) {
          --shade-size: var(--open-shade-size);
        }

      .jar:active {
        transform: var(--open-transform) translateY(2px);
        transition-duration: 50ms;
      }
    }

  .shadow {
    /*
     * Layer for more realistic effect
     * See:  https://tobiasahlin.com/blog/layered-smooth-box-shadows/
     * Spread should offset the translateZ
     */
    box-shadow: 
      0 2px 6px 0px hsla(var(--hsl), 0.03),
      0 4px 12px -2px hsla(var(--hsl), 0.05),
      0 8px 20px -2px hsla(var(--hsl), 0.07)
    ;
    --hsl: var(--color-hue, 0), var(--color-saturation, 0%), 15%;
  }

  .jar :global(.base) {
    --shade-size: 0px;
    --open-shade-size: clamp(7px, var(--radius), 12px);
  } 

    /* Border to maintain contrast despite coins and a gradient shade to help open state */
    .jar :global(.base)::after {
      box-shadow:
        inset 0 var(--shade-size) var(--shade-size) calc(-1*var(--shade-size)) var(--color),
        inset 0 var(--shade-size) var(--shade-size) calc(-1*var(--shade-size)) var(--color),
        inset 0 var(--shade-size) var(--shade-size) calc(-1*var(--shade-size)) var(--color),
        inset 0 var(--shade-size) var(--shade-size) calc(-1*var(--shade-size)) var(--color),
        inset 0 var(--shade-size) var(--shade-size) calc(-1*var(--shade-size)) var(--color),
        inset 0 0 0/*3px TODO turn this on via glassiness*/ 1px var(--color)
      ;
      border-radius: var(--radius);
      content: '';
      opacity: 0.8;
      position: absolute;
      transition: box-shadow var(--transition-duration) var(--transition-timing-function);
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
    }

  .jar :global(.coins) {
    /* Does a better job than overflow: hidden with border-radius */
    clip-path: inset(0 0 0 0 round var(--radius));
  }

  span {
    position: relative;
  }

  .opening {
    position: absolute;
    background: linear-gradient(to bottom, hsl(var(--color-hue), var(--color-saturation), calc(var(--color-lightness) - 12%)), hsl(var(--color-hue), var(--color-saturation), calc(var(--color-lightness) - 20%)));
    border-radius: 100%;
    opacity: 0.5;
    box-shadow: 0 1px 1px rgba(255, 255, 255, 0.15);
    /*
     * Scale helps the transition in case the hole is bigger than what's visually allowed,
     * translateY keeps it out of the way from the base and back planes (lowest number that works)
     */
    transform: translate3d(-50%, calc(-50%), calc(var(--depth)*1px / -2)) rotateX(90deg) scaleX(clamp(0.1, var(--hole-space) / var(--hole), 1));
    backface-visibility: hidden;
    left: 50%;
    top: 0;
    width: calc(var(--hole)*1px);
    height: calc(var(--hole)*1px);
  }
</style>