import * as React from "react"

const useSafeLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

/**
 * React effect hook that invokes only on update.
 * It doesn't invoke on mount
 */
export const useUpdateEffect: typeof React.useEffect = (effect, deps) => {
  const renderCycleRef = React.useRef(false)
  const effectCycleRef = React.useRef(false)

  useSafeLayoutEffect(() => {
    const isMounted = renderCycleRef.current
    const shouldRun = isMounted && effectCycleRef.current
    if (shouldRun) {
      return effect()
    }
    effectCycleRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useSafeLayoutEffect(() => {
    renderCycleRef.current = true
    return () => {
      renderCycleRef.current = false
    }
  }, [])
}
