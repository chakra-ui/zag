import { isEqual, isFunction } from "@zag-js/utils"
import { createEffect, createSignal, untrack } from "solid-js"

function access<T>(v: T | (() => T)): T {
  if (isFunction(v)) return v()
  return v
}

export const createTrack = (deps: any[], effect: VoidFunction) => {
  // Baseline at creation, so a change before the first effect run still notifies
  let prevDeps = untrack(() => deps.map((d) => access(d)))
  createEffect(() => {
    const nextDeps = deps.map((d) => access(d))
    if (nextDeps.some((dep, i) => !isEqual(prevDeps[i], dep))) {
      prevDeps = nextDeps
      effect()
    }
  })
}

/** Solid does not re-render, so `notify` bumps a signal to re-subscribe when the effect set changes. */
export const createEffectSync = (reconcile: VoidFunction): VoidFunction => {
  const [version, setVersion] = createSignal(0)
  createEffect(() => {
    version()
    reconcile()
  })
  return () => setVersion((n) => n + 1)
}
