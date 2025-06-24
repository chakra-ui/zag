import { isEqual } from "@zag-js/utils"
import { toValue, watch } from "vue"

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
