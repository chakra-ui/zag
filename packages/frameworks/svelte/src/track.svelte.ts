import { isEqual } from "@zag-js/utils"
import { untrack } from "svelte"

const access = (value: any) => {
  if (typeof value === "function") return value()
  return value
}

export const track = (deps: any[], effect: VoidFunction) => {
  // Taken when the machine is created, alongside its initial state, so a dep that changes
  // before the effect's first run (an earlier sibling's effect writing a prop) still notifies.
  let prevDeps = untrack(() => deps.map((d) => access(d)))
  $effect(() => {
    const nextDeps = deps.map((d) => access(d))
    if (nextDeps.some((dep, i) => !isEqual(prevDeps[i], dep))) {
      prevDeps = nextDeps
      effect()
    }
  })
}
