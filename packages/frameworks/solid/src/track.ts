import { createEffect, on } from "solid-js"

export const createTrack = (deps: any[], effect: VoidFunction) => {
  deps.forEach((d) => {
    createEffect(on(d, effect, { defer: true }))
  })
}
