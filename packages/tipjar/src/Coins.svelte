<script context="module">
  export const loadMatter = () => new Promise((resolve, reject) => {
    var script = document.createElement('script')
    script.onload = () => resolve(window.Matter)
    script.src = 'https://unpkg.com/matter-js@0.18.0/build/matter.js'
    document.head.appendChild(script)
  })
</script>

<script>
  import { onMount, onDestroy } from 'svelte'
  import { latestTip } from './lib/stores'
  import { darken, toRgba } from 'color2k'
  import { pageLoaded, sleep, isInView } from './lib/util'

  export let w
  export let h
  export let r
  export let c
  export let paused = false
  export let matter

  const things = []

  const engine = matter.Engine.create({
    enableSleeping: true // puts bodies to sleep when they come to rest, saves a lot on perf
  })
  const world = engine.world
  const runner = matter.Runner.create()

  let wrapper, render
  onMount(async() => {
    render = matter.Render.create({
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

    matter.Render.run(render)
    matter.Runner.run(runner, engine)

    // Increase chance of smooth initial animation
    await pageLoaded
    await sleep(500)
    // I don't like the idea of doing this on a transformed element
    await isInView(wrapper?.closest && wrapper?.closest('.jar'))

    // Add walls
    matter.Composite.add(world, [
        matter.Bodies.rectangle(w / 2, h+5, w, 10, { isStatic: true, render: { visible: false } }), // bottom
        matter.Bodies.rectangle(w+5, h / 2, 10, h, { isStatic: true, render: { visible: false } }), // right
        matter.Bodies.rectangle(-5, h / 2, 10, h, { isStatic: true, render: { visible: false } }), // left,
        // Bottom left corner
        ...Array.from({ length: r }, (_, i) => {
          const theta = Math.PI + Math.asin(i / r)
          const width = r + r*Math.cos(theta)
          return matter.Bodies.rectangle(width/2, h-r+i+0.5, width, 1, { isStatic: true, render: { visible: false } })
        }),
        // Bottom right corner
        ...Array.from({ length: r }, (_, i) => {
          const theta = 2 * Math.PI - Math.asin(i / r)
          const width = r - r*Math.cos(theta)
          return matter.Bodies.rectangle(w - width/2, h-r+i+0.5, width, 1, { isStatic: true, render: { visible: false } })
        })
    ])

    const stack = matter.Composites.stack(w / 2 - 12, -40, 3, 4, 0, 0, (x, y) => addCoin({ x, y, add: false }))

    matter.Composite.add(world, stack)
  })

  onDestroy(() => {
      matter.Render.stop(render)
      matter.Runner.stop(runner)
      matter.Engine.clear(engine)
  })

  function addCoin({ x, y = 0, add = true } = {}) {
    const [size, darkenAmount] = matter.Common.choose([[3, .6*.1], [4, .8*.1], [5, .1]])
    const coin = matter.Bodies.circle(x ?? w/2 - size/2 + 1, y, size, {
      restitution: 0.75,
      render: {
        fillStyle: toRgba(darken(c, darkenAmount))
      }
    })

    if (add) matter.Composite.add(world, coin)
    things.push(coin)
    return coin
  }

  export function addNote() {
    const [width, height] = matter.Common.choose([[6, 8], [8, 8]])
    const note = matter.Bodies.rectangle(w/2 - width/2 + 1, -10, width, height, {
      friction: 0.1,
      density: 0.0001,
      frictionAir: 0.75,
      render: {
        fillStyle: '#000'
      }
    })

    matter.Composite.add(world, note)
    things.push(note)
    return note
  }

  // setInterval(() => Common.choose([addNote(), addCoin()]), 1500)
  // setInterval(addCoin, 1500)
</script>

<div style="width: min-content" bind:this={wrapper}></div>