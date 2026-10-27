import { isEqual, isFunction } from "@zag-js/utils"
import { createEffect, createSignal } from "solid-js"

function access<T>(v: T | (() => T)): T {
  if (isFunction(v)) return v()
  return v
}

export const createTrack = (deps: any[], effect: VoidFunction) => {
  let prevDeps: any[] | undefined
  createEffect(
    () => deps.map((d) => access(d)),
    (next) => {
      if (!prevDeps) {
        prevDeps = next
        return
      }
      let changed = false
      for (let i = 0; i < next.length; i++) {
        if (!isEqual(prevDeps[i], next[i])) {
          changed = true
          break
        }
      }
      if (changed) {
        prevDeps = next
        effect()
      }
    },
  )
}

/**
 * Solid does not re-render, so `notify` bumps a signal to re-read when the effect set changes.
 * `read` runs tracked (it subscribes to the effects' deps); `apply` runs untracked with its result.
 */
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
