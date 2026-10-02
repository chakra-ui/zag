import { isEqual, isFunction } from "@zag-js/utils"
import { createEffect } from "solid-js"
import { runInQueue } from "./flush"

function access<T>(v: T | (() => T)): T {
  if (isFunction(v)) return v()
  return v
}

export const createTrack = (deps: any[], effect: VoidFunction) => {
  let prevDeps: any[] | undefined
  createEffect(
    () => deps.map((d) => access(d)),
    (nextDeps) => {
      const isFirstRun = prevDeps === undefined
      const changed = !isFirstRun && nextDeps.some((dep, i) => !isEqual(prevDeps![i], dep))
      prevDeps = nextDeps
      if (changed) runInQueue(effect)
    },
  )
}
