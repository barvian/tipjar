<script>
  import Coins from './Coins.svelte'

  export let radius = 60
  export let color = 'rgba(255, 255, 255, 0.9)'
  export let labelColor = '#000'
  export let showCoins = true

  let tipping = false

  let w, h, coins
  $: r = h ? Math.min(h / 2, radius) : radius // compute actual radius, i.e. if 999px
  $: holeSpace = w ? w - r*2 : 0
</script>

<div class="wrapper">
  <div class="tip"
    bind:clientWidth={w} bind:clientHeight={h}
    tabindex="0" role="button"
    aria-expanded={tipping} aria-controls="tip"
    style="
      --radius: {radius};
      --color: {color};
      --label-color: {labelColor};
      --hole-space: {holeSpace};
    "
  >
    <div class="shadow"></div>
    <div class="base">
      {#if showCoins && w && h && radius}
      <Coins {w} {h} {radius} bind:this={coins} />
      {/if}
    </div>
    <span>Tips</span>
    <div class="opening"></div>
  </div>

  <div id="tip"></div>
</div>

<style> 
  *, *::before, *::after {
    box-sizing: content-box;
    padding: 0;
    margin: 0;
  }

  .wrapper {
    perspective: 800px;
    width: min-content;
  }

  .tip {
    align-items: center;
    display: flex;
    justify-content: center;
    color: var(--label-color);
    font-weight: bold;
    font-family: sans-serif;
    width: 76px;
    height: 66px;
    transform-origin: 50% 300%;
    transform-style: preserve-3d;
    transition: transform var(--transition);
    will-change: transform;
    cursor: pointer;
    user-select: none;

    --transition: 250ms ease-out;
    --min-hole: calc(var(--hole-space) + 16);
    --hole: min(var(--min-hole), 32);
  }

  .base {
    /*backdrop-filter: blur(4px); this kills it in Chrome*/
    background-color: var(--color);
    border-radius: calc(var(--radius) * 1px);
    position: absolute;
    overflow: hidden;
    top: 0;
    transition: transform var(--transition);
    transform: translateZ(-24px);
    transform-origin: center;
    left: 0;
    width: 100%;
    height: 100%;
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

    .tip:hover .shadow {
      filter: blur(1px);
      /* compensate for the lack of actual 3d */
      transform: translateZ(-40px) translateY(12%);
    }

  .tip:hover {
    transform: rotateX(-15deg);
  }

  .tip:hover .base {
    /* compensate for the lack of actual 3d */
    transform: translateZ(-33px) scaleY(1.05) translateY(5%);
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

  .tip:hover .opening {
    transform: translate3d(-50%, 0, -24px) rotateX(90deg);
  }
</style>