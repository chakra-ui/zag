import { noop } from "@zag-js/utils"
import { useEffect, useRef } from "preact/hooks"

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

/** `notify` is a no-op here: Preact re-renders on prop changes, so there is nothing to subscribe to. */
export const useEffectSync = (reconcile: VoidFunction): VoidFunction => {
  useEffect(reconcile)
  return noop
}
