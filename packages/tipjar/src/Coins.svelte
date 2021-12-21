<script>
  import { onMount } from 'svelte'
  import { Engine, Render, Common, Runner, Composite, Composites, Body, Bodies } from 'matter-js'
  import { latestTip } from './stores'

  export let w
  export let h
  export let radius
  export let paused = false

  const things = []

  const engine = Engine.create({
    enableSleeping: true // puts bodies to sleep when they come to rest, saves a lot on perf
  })
  const world = engine.world
  const runner = Runner.create()

  let wrapper
  onMount(() => {
    const render = Render.create({
      element: wrapper,
      engine,
      options: {
        pixelRatio: 'auto', // I think it might actually be better a little blurry
        width: w,
        height: h,
        showSleeping: false,
        wireframes: false,
        background: 'transparent'
      }
    })

    Render.run(render)
    Runner.run(runner, engine)

    // Add walls
    const r = Math.min(h / 2, radius)
    Composite.add(world, [
        Bodies.rectangle(w / 2, h+5, w, 10, { isStatic: true, render: { visible: false } }), // bottom
        Bodies.rectangle(w+5, h / 2, 10, h, { isStatic: true, render: { visible: false } }), // right
        Bodies.rectangle(-5, h / 2, 10, h, { isStatic: true, render: { visible: false } }), // left,
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

    const stack = Composites.stack(w / 2 - 9, -40, 3, 4, 0, 0, (x, y) => addCoin({ x, y, add: false }))

    Composite.add(world, stack)

    return () => {
      Render.stop(render)
      Runner.stop(runner)
      Engine.clear(engine)
    }
  })

  function addCoin({ x, y = 0, add = true } = {}) {
    const size = Common.choose([3, 4, 5])
    const coin = Bodies.circle(x ?? w/2 - size/2 + 1, y, size, {
      friction: 0.1,
      // restitution: 0.75, // this bugs out when it gets full
      render: {
        fillStyle: '#000'
      }
    })

    if (add) Composite.add(world, coin)
    things.push(coin)
    return coin
  }

  export function addNote() {
    const [width, height] = Common.choose([[6, 8], [8, 8]])
    const note = Bodies.rectangle(w/2 - width/2 + 1, -10, width, height, {
      friction: 0.1,
      density: 0.0001,
      frictionAir: 0.75,
      // restitution: 0.75, // this bugs out when it gets full
      render: {
        fillStyle: '#000'
      }
    })

    Composite.add(world, note)
    things.push(note)
    return note
  }

  // setInterval(() => Common.choose([addNote(), addCoin()]), 1500)
</script>

<div class="wrapper" style="width: min-content" bind:this={wrapper}></div>

<style>
	.wrapper {
		opacity: 0.15;
	}
</style>