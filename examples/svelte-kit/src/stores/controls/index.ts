import { ControlRecord, ControlValue } from "@zag-js/shared"
import { writable } from "svelte/store"
export { default as ControlsUI } from "./ui.svelte"

function getDefaultValues<T extends ControlRecord>(obj: T) {
  return Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      [key]: obj[key].defaultValue,
    }),
    {} as ControlValue<T>,
  )
}

export function useControls<T extends ControlRecord>(config: T) {
  return writable(getDefaultValues(config))
}
