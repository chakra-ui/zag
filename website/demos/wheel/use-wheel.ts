import { normalizeProps } from "@zag-js/react"
import { useEffect, useLayoutEffect, useRef } from "react"
import * as wheel from "./wheel"

export function useWheel(props: wheel.WheelProps) {
  // The scroll listener outlives renders, so it reads the latest props from a ref
  const propsRef = useRef(props)
  propsRef.current = props
  const mounted = useRef(false)

  // Scrolling picks the value
  useEffect(() => {
    const el = wheel.getViewportEl(props.id)
    if (!el) return
    return wheel.trackScrollEnd(el, () => wheel.settle(propsRef.current, el))
  }, [props.id])

  // The value moves the scroll position: on mount, from the keyboard, or from outside
  useLayoutEffect(() => {
    const el = wheel.getViewportEl(props.id)
    // A keyboard move already scrolled to the right copy of the row
    if (!el || wheel.hasPendingRow(props.id)) return
    const current = wheel.getCenterRow(propsRef.current, el)
    const row = wheel.getRowOf(
      propsRef.current,
      props.value,
      mounted.current ? current : undefined,
    )
    if (row !== current) {
      wheel.scrollToRow(
        propsRef.current,
        el,
        row,
        mounted.current ? "smooth" : "instant",
      )
    }
    mounted.current = true
  }, [props.id, props.value])

  return wheel.connect(props, normalizeProps)
}
