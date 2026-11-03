import { isEqual, isFunction } from "@zag-js/utils"
import { createEffect, createSignal, untrack } from "solid-js"

function access<T>(v: T | (() => T)): T {
  if (isFunction(v)) return v()
  return v
}

export const createTrack = (deps: any[], effect: VoidFunction) => {
  let prevDeps = untrack(() => deps.map((d) => access(d)))
  createEffect(
    () => deps.map((d) => access(d)),
    (next) => {
      if (next.some((dep, i) => !isEqual(prevDeps[i], dep))) {
        prevDeps = next
        untrack(effect)
      }
    },
  )
}

/** Re-subscribe when the set of running effects changes. */
export const createEffectSync = <T>(read: () => T, apply: (value: T) => void): VoidFunction => {
  const [version, setVersion] = createSignal(0)
  createEffect(
    () => {
      version()
      return read()
    },
    (value) => apply(value),
  )
  return () => setVersion((n) => n + 1)
}
