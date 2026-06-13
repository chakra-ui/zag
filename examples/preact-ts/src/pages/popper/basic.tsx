import { getPlacement, getPlacementStyles } from "@zag-js/popper"
import { useEffect, useLayoutEffect, useRef, useState } from "react"

const useSafeEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

export default function App() {
  const referenceRef = useRef<HTMLButtonElement>(null)
  const floatingRef = useRef<HTMLDivElement>(null)
  const [positioned, setPositioned] = useState({})

  useSafeEffect(() => {
    if (!referenceRef.current || !floatingRef.current) return
    return getPlacement(referenceRef.current, floatingRef.current, {
      placement: "right-start",
      onComplete(data) {
        setPositioned(data)
      },
    })
  }, [])

  const styles = getPlacementStyles(positioned)

  return (
    <div>
      <button ref={referenceRef}>Hello StackBlitz!</button>
      <div style={styles.floating} ref={floatingRef}>
        Start editing to see some magic happen :)
      </div>
    </div>
  )
}
