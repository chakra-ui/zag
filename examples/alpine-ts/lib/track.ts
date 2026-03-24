import { isEqual } from "@zag-js/utils"
import Alpine from "alpinejs"

export const track = (deps: any[], effect: VoidFunction) => {
  // @ts-ignore @types/alpinejs is outdated
  Alpine.watch(
    () => [...deps.map((d) => d())],
    (current: any[], previous: any[]) => {
      let changed = false
      for (let i = 0; i < current.length; i++) {
        if (!isEqual(previous[i], current[i])) {
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
