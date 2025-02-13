import { useEffect, useRef } from "react"

export const useTrack = (deps: any[], effect: VoidFunction) => {
  const render = useRef(false)
  const called = useRef(false)

  useEffect(() => {
    const mounted = render.current
    const run = mounted && called.current
    if (run) return effect()
    called.current = true
  }, [...(deps ?? []).map((d) => (typeof d === "function" ? d() : d))])

  useEffect(() => {
    render.current = true
    return () => {
      render.current = false
    }
  }, [])
}
