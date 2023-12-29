import { getControlDefaults, type ControlRecord, type ControlValue, deepSet, deepGet } from "@zag-js/shared"
import type { UnwrapRef } from "vue"

export interface UseControlsReturn<T extends ControlRecord> {
  config: T
  context: Ref<UnwrapRef<ControlValue<T>>>
  setState: (key: string, value: any) => void
  getState: (key: string) => any
  keys: (keyof T)[]
}

export const useControls = <T extends ControlRecord>(config: T): UseControlsReturn<T> => {
  const state = ref<any>(getControlDefaults(config))

  const setState = (key: string, value: any) => {
    const newState = unref(state)
    deepSet(newState, key, value)
    state.value = newState
  }

  const getState = (key: string) => {
    return deepGet(unref(state), key)
  }

  return {
    config,
    context: state,
    setState,
    getState,
    keys: Object.keys(config) as (keyof ControlValue<T>)[],
  }
}
