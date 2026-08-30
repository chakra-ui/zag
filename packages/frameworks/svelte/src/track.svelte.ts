import { isEqual } from "@zag-js/utils"
import { untrack } from "svelte"

const access = (value: any) => {
  if (typeof value === "function") return value()
  return value
}

export const track = (deps: any[], effect: VoidFunction) => {
  let prevDeps: any[] = []
  let isFirstRun = true
  $effect(() => {
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

/** Svelte does not re-render, so `notify` bumps a rune to re-subscribe when the effect set changes. */
export const effectSync = (reconcile: VoidFunction): VoidFunction => {
  let version = $state(0)
  $effect(() => {
    version
    reconcile()
  })
  return () => {
    untrack(() => version++)
  }
}
