import { deepGet, deepSet, getControlDefaults, type ControlRecord, type ControlValue } from "@zag-js/shared"
import type { ComputedRef, UnwrapRef } from "vue"

export interface UseControlsReturn<T extends ControlRecord> {
  config: T
  context: Ref<UnwrapRef<ControlValue<T>>>
  setState: (key: string, value: any) => void
  getState: (key: string) => any
  keys: (keyof T)[]
  mergeProps: <P extends Partial<ControlValue<T>>>(props: P) => ComputedRef<ControlValue<T> & P>
}

export const useControls = <T extends ControlRecord>(config: T): UseControlsReturn<T> => {
  const state = ref<any>(getControlDefaults(config))

  const setState = (key: string, value: any) => {
    const newState = unref(state)
    deepSet(newState, key, value)
    state.value = newState
  }

  const getState = (key: string) => {
    return computed(() => deepGet(unref(state), key))
  }

  return {
    config,
    context: state,
    setState,
    getState,
    keys: Object.keys(config) as (keyof ControlValue<T>)[],
    mergeProps: <P extends Partial<ControlValue<T>>>(props: P): ComputedRef<ControlValue<T> & P> => {
      return computed(() => ({
        ...toValue(state),
        ...props,
      }))
    },
  }
}
