import type { ControlRecord, ControlValue } from "@zag-js/shared"
import type { UnwrapRef } from "vue"

function getDefaultValues<T extends ControlRecord>(obj: T) {
  return Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      [key]: obj[key].defaultValue,
    }),
    {} as ControlValue<T>,
  )
}

export type UseControlsReturn<T extends ControlRecord> = {
  config: T
  context: Ref<UnwrapRef<ControlValue<T>>>
  keys: (keyof T)[]
}

export const useControls = <T extends ControlRecord>(config: T): UseControlsReturn<T> => {
  const defaults = getDefaultValues(config)
  const state = ref(defaults)

  return {
    config,
    context: state,
    keys: Object.keys(config) as (keyof ControlValue<T>)[],
  }
}
