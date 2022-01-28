import { getFloatingStyle, getPlacement } from "@ui-machines/popper"
import React, { useEffect, useLayoutEffect } from "react"

const useSafeEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

export default function App() {
  const referenceRef = React.useRef<HTMLButtonElement>(null)
  const floatingRef = React.useRef<HTMLDivElement>(null)

  useSafeEffect(() => {
    if (!referenceRef.current || !floatingRef.current) return
    return getPlacement(referenceRef.current, floatingRef.current, {
      placement: "right-start",
    })
  }, [])

  return (
    <div>
      <button ref={referenceRef}>Hello StackBlitz!</button>
      <div style={getFloatingStyle()} ref={floatingRef}>
        Start editing to see some magic happen :)
      </div>
    </div>
  )
}
