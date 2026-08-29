import { isEqual } from "@zag-js/utils"
import { shallowRef, toValue, watch, watchEffect } from "vue"

export const useTrack = (deps: any[], effect: VoidFunction) => {
  watch(
    () => [...deps.map((d) => d())],
    (current, previous) => {
      let changed = false
      for (let i = 0; i < current.length; i++) {
        if (!isEqual(previous[i], toValue(current[i]))) {
          changed = true
          break
        }
      }
      if (changed) {
        effect()
      }
    },
  )
}

/** Vue does not re-render, so `notify` bumps a version to re-subscribe when the effect set changes. */
export const useEffectSync = (reconcile: VoidFunction): VoidFunction => {
  const version = shallowRef(0)
  watchEffect(() => {
    version.value
    reconcile()
  })
  return () => {
    version.value++
  }
}
