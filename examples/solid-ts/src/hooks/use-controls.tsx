import { ControlRecord, deepSet, getControlDefaults } from "@zag-js/shared"
import { Accessor, createMemo, createSignal, mergeProps } from "solid-js"

export function useControls<T extends ControlRecord>(config: T) {
  const [state, __setState] = createSignal(getControlDefaults(config) as any)

  const setState = (key: string, value: any) => {
    __setState((s) => {
      const newState = structuredClone(s)
      deepSet(newState, key, value)
      return newState
    })
  }

  return {
    state,
    setState,
    config,
    mergeProps: <T extends object>(props: T | Accessor<T>): Accessor<T> => {
      return createMemo(() => mergeProps(state(), typeof props === "function" ? props() : props))
    },
  }
}

export type UseControlsReturn = ReturnType<typeof useControls>
