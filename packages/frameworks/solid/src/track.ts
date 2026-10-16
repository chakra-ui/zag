import { isEqual, isFunction } from "@zag-js/utils"
import { createEffect, untrack } from "solid-js"

function access<T>(v: T | (() => T)): T {
  if (isFunction(v)) return v()
  return v
}

export const createTrack = (deps: any[], effect: VoidFunction) => {
  // Taken at creation, with the initial state, so a dep written before the effect's first run still notifies.
  let prevDeps = untrack(() => deps.map((d) => access(d)))
  createEffect(() => {
    const nextDeps = deps.map((d) => access(d))
    if (nextDeps.some((dep, i) => !isEqual(prevDeps[i], dep))) {
      prevDeps = nextDeps
      effect()
    }
  })
}
