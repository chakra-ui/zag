import { PLACEMENT_STYLE, getPlacement } from "@ui-machines/popper"
import React, { useEffect, useLayoutEffect } from "react"

const useSafeEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

export default function App() {
  const referenceRef = React.useRef<HTMLButtonElement>(null)
  const floatingRef = React.useRef<HTMLDivElement>(null)

  useSafeEffect(() => {
    if (!referenceRef.current || !floatingRef.current) return
    const utils = getPlacement(referenceRef.current, floatingRef.current, {
      placement: "right-start",
    })
    utils.compute()
    return utils.addListeners()
  }, [])

  return (
    <div>
      <button ref={referenceRef}>Hello StackBlitz!</button>
      <div style={PLACEMENT_STYLE.floating()} ref={floatingRef}>
        Start editing to see some magic happen :)
      </div>
    </div>
  )
}
