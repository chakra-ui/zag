import { noop } from "@zag-js/utils"
import { useEffect, useRef } from "preact/hooks"

export const useTrack = (deps: any[], effect: VoidFunction) => {
  const values = (deps ?? []).map((d) => (typeof d === "function" ? d() : d))
  const previous = useRef<any[] | null>(null)

  // Compare against the last run, not a mounted flag, so remounted effects don't drop changes
  useEffect(() => {
    const prev = previous.current
    previous.current = values
    if (prev === null) return

    const changed = prev.length !== values.length || values.some((value, index) => !Object.is(value, prev[index]))
    if (changed) return effect()
  }, values)
}

/** `notify` is a no-op here: Preact re-renders on prop changes, so there is nothing to subscribe to. */
export const useEffectSync = (reconcile: VoidFunction): VoidFunction => {
  useEffect(reconcile)
  return noop
}
