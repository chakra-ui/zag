import { isEqual, isFunction } from "@zag-js/utils"
import { createEffect, createSignal } from "solid-js"

function access<T>(v: T | (() => T)): T {
  if (isFunction(v)) return v()
  return v
}

export const createTrack = (deps: any[], effect: VoidFunction) => {
  let prevDeps: any[] = []
  let isFirstRun = true
  createEffect(() => {
    if (isFirstRun) {
      prevDeps = deps.map((d) => access(d))
      isFirstRun = false
      return
    }
    let changed = false
    for (let i = 0; i < deps.length; i++) {
      if (!isEqual(prevDeps[i], access(deps[i]))) {
        changed = true
        break
      }
    }
    if (changed) {
      prevDeps = deps.map((d) => access(d))
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
