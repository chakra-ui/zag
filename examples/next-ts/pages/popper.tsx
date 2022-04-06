import { getPlacementStyles, getPlacement } from "@zag-js/popper"
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

  const styles = getPlacementStyles({ measured: true })

  return (
    <div>
      <button ref={referenceRef}>Hello StackBlitz!</button>
      <div style={styles.floating} ref={floatingRef}>
        Start editing to see some magic happen :)
      </div>
    </div>
  )
}
