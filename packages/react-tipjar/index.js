import React, { useRef, useEffect, useState } from 'react'
import TipJar from '@tipkit/jar'

export default function ReactTipJar(props) {
  const container = useRef(null)
  const component = useRef(null)
  const [mounted, setMount] = useState(false)

  useEffect(() => {
    component.current = new TipJar({ target: container.current, props })

    return () => {
      component.current.$destroy()
    }
  }, [])

  useEffect(() => {
    if (!mounted) {
      setMount(true)
      return
    }

    component.current.$set(props)
  }, [props])

  return React.createElement('div', { ref: container })
}