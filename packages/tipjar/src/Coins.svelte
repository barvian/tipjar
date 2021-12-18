<script>
  import { onMount } from 'svelte'
  import { Engine, Render, Common, Runner, Composite, Composites, Body, Bodies } from 'matter-js'

  export let w
  export let h
  export let radius

  const engine = Engine.create(), world = engine.world, runner = Runner.create()

  let wrapper
  onMount(() => {
    const render = Render.create({
      element: wrapper,
      engine,
      options: {
        pixelRatio: 'auto', // I think it might actually be better a little blurry
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

    const stack = Composites.stack(w / 2 - 9, 0, 3, 4, 0, 0, (x, y) =>
        Bodies.circle(x, y, Common.choose([3, 4, 5]), {
          friction: 0.1,
          // restitution: 0.6,
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

<div class="wrapper" style="width: min-content" bind:this={wrapper}></div>

<style>
	.wrapper {
		opacity: 0.15;
	}
</style>