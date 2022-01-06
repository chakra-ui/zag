import { DEFAULT_FLOATING_STYLE, getPlacementData } from "@ui-machines/dom-utils"
import React, { useEffect, useLayoutEffect } from "react"

const useSafeEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

export default function App() {
  const referenceRef = React.useRef<HTMLButtonElement>(null)
  const floatingRef = React.useRef<HTMLDivElement>(null)

  useSafeEffect(() => {
    if (!referenceRef.current || !floatingRef.current) return
    const utils = getPlacementData(referenceRef.current, floatingRef.current, {
      placement: "right-start",
    })
    utils.compute()
    return utils.addListeners()
  }, [])

  return (
    <div>
      <button ref={referenceRef}>Hello StackBlitz!</button>
      <div style={DEFAULT_FLOATING_STYLE} ref={floatingRef}>
        Start editing to see some magic happen :)
      </div>
    </div>
  )
}
