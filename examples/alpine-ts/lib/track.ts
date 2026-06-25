import { isEqual } from "@zag-js/utils"
import Alpine from "alpinejs"

export const track = (deps: any[], effect: VoidFunction) => {
  // @ts-ignore @types/alpinejs is outdated
  Alpine.watch(
    () => Object.fromEntries(deps.map((d, i) => [i, d()])),
    (current: any, previous: any) =>
      Object.keys(current).some((key) => !isEqual(current[key], previous[key])) && effect(),
  )
}
