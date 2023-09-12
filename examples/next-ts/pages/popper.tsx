import { getPlacementStyles, getPlacement } from "@zag-js/popper"
import { useEffect, useLayoutEffect, useRef } from "react"

const useSafeEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

export default function App() {
  const referenceRef = useRef<HTMLButtonElement>(null)
  const floatingRef = useRef<HTMLDivElement>(null)

  useSafeEffect(() => {
    if (!referenceRef.current || !floatingRef.current) return
    return getPlacement(referenceRef.current, floatingRef.current, {
      placement: "right-start",
    })
  }, [])

  const styles = getPlacementStyles({ placement: "bottom" })

  return (
    <div>
      <button ref={referenceRef}>Hello StackBlitz!</button>
      <div style={styles.floating} ref={floatingRef}>
        Start editing to see some magic happen :)
      </div>
    </div>
  )
}
