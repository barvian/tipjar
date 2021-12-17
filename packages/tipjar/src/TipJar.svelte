<script>
  import { onMount } from 'svelte'
  import { Engine, Render, Common, Runner, Composite, Composites, Body, Bodies } from 'matter-js'

  export let radius = 60
  export let color = 'rgba(255, 255, 255, 0.9)'
  export let labelColor = '#000'

  let w, h
  $: hole = w ? w - radius : 0

  const engine = Engine.create(), world = engine.world, runner = Runner.create()

  let coins
  onMount(() => {
    // TODO: sleeping
    const render = Render.create({
      element: coins,
      engine,
      options: {
        width: w,
        height: h,
        wireframes: false,
        background: 'transparent'
      }
    })

    Render.run(render)
    Runner.run(runner, engine)

    // Add walls
    const r = Math.min(h / 2, radius)
    Composite.add(world, [
        Bodies.rectangle(w / 2, h, w, 1, { isStatic: true, render: { visible: false } }), // bottom
        Bodies.rectangle(w, h / 2, 1, h, { isStatic: true, render: { visible: false } }), // right
        Bodies.rectangle(0, h / 2, 1, h, { isStatic: true, render: { visible: false } }), // left,
        // Bottom left corner
        ...Array.from({ length: r }, (_, i) => {
          const theta = Math.PI + Math.asin(i / r)
          const width = r + r*Math.cos(theta)
          return Bodies.rectangle(width/2, h-r+i+0.5, width, 1, { isStatic: true, render: { visible: false } })
        }),
        // Bottom right corner
        ...Array.from({ length: r }, (_, i) => {
          const theta = 2 * Math.PI - Math.asin(i / r)
          const width = r - r*Math.cos(theta)
          return Bodies.rectangle(w - width/2, h-r+i+0.5, width, 1, { isStatic: true, render: { visible: false } })
        })
    ])

    const stack = Composites.stack(w / 2 - 4, 0, 3, 8, 0, 0, (x, y) =>
        Bodies.circle(x, y, Common.random(1, 2), {
          restitution: 0.6,
          friction: 0.1, 
          render: {
            fillStyle: '#000'
          }
        })
    )

    Composite.add(world, stack)    

    return () => {
      Render.stop(render)
      Runner.stop(runner)
      Engine.clear(engine)
    }
  })
</script>

<div class="wrapper">
  <div class="tip" bind:clientWidth={w} bind:clientHeight={h} style="
    --radius: {radius};
    --color: {color};
    --label-color: {labelColor};
    --hole: {hole};
  ">
    <div class="base">
      <div class="coins" bind:this={coins}></div>
    </div>
    <span>Tips</span>
    <div class="opening"></div>
  </div>
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
  width: 74px;
  height: 66px;
  transform-origin: 50% 300%;
  transform-style: preserve-3d;
  transition: transform var(--transition);
  will-change: transform;
  cursor: pointer;
  user-select: none;

  --transition: 250ms ease-out;
}

.base {
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 2px 20px rgba(0, 0, 0, 0.12);
  background-color: var(--color);
  border-radius: calc(var(--radius) * 1px);
  position: absolute;
  /*overflow: hidden;*/
  top: 0;
  transition: transform var(--transition);
  transform: translateZ(-24px);
  transform-origin: center;
  left: 0;
  width: 100%;
  height: 100%;
}

.coins {
  opacity: 0.15;
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
  transform: translate3d(-50%, 1px, -24px) rotateX(90deg) scaleX(min(var(--hole, 32) / 32, 1));
  transition: transform var(--transition);
  transform-origin: 50% 0%;
  backface-visibility: hidden;
  left: 50%;
  top: 0;
  width: 32px;
  height: 32px;
}

.tip:hover .opening {
  transform: translate3d(-50%, 0, -24px) rotateX(90deg);
}
</style>