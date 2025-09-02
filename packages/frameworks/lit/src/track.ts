import { isEqual, isFunction } from "@zag-js/utils"
import { createEffect } from "solid-js"

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
