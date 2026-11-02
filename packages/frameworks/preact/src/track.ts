import { noop } from "@zag-js/utils"
import { useEffect, useLayoutEffect, useRef } from "preact/hooks"

export const useTrack = (deps: any[], effect: VoidFunction) => {
  const values = (deps ?? []).map((d) => (typeof d === "function" ? d() : d))
  const previous = useRef<any[] | null>(null)

  // Compare against the last run, not a mounted flag, so remounted effects don't drop changes.
  // A layout effect, since Preact runs passive effects after paint and doesn't flush them before
  // the next event, so a watcher (e.g. one syncing an input's value) would act on stale state.
  useLayoutEffect(() => {
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
