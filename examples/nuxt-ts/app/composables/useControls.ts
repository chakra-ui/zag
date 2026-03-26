import {
  deepGet,
  deepSet,
  getControlDefaults,
  getTransformedControlValues,
  type ControlRecord,
  type ControlValue,
} from "@zag-js/shared"
import { computed, ref, toRaw, toValue, type ComputedRef, type Ref, type UnwrapRef } from "vue"

export interface UseControlsReturn<T extends ControlRecord> {
  config: T
  context: Ref<UnwrapRef<ControlValue<T>>>
  setState: (key: string, value: any) => void
  getState: (key: string) => any
  keys: (keyof T)[]
  mergeProps: <P>(props: Partial<P>) => ComputedRef<ControlValue<T> & Partial<P>>
}

export const useControls = <T extends ControlRecord>(config: T): UseControlsReturn<T> => {
  const state = ref<any>(getControlDefaults(config))

  const setState = (key: string, value: any) => {
    const newState = toValue(state)
    deepSet(newState, key, value)
    state.value = newState
  }

  const getState = (key: string) => {
    return deepGet(toValue(state), key)
  }

  return {
    config,
    context: state,
    setState,
    getState,
    keys: Object.keys(config) as (keyof ControlValue<T>)[],
    mergeProps: <P>(props: Partial<P>): ComputedRef<ControlValue<T> & P> => {
      return computed(() => ({
        ...getTransformedControlValues(config, toRaw(toValue(state))),
        ...props,
      }))
    },
  }
}
