import { getControlDefaults, getTransformedControlValues, type ControlRecord, deepSet } from "@zag-js/shared"

export function useControls<T extends ControlRecord>(config: T) {
  const context = $state(getControlDefaults(config))

  const controls = {
    get config() {
      return config
    },
    get context() {
      return context
    },
    setContext(key: string, value: any) {
      deepSet(context, key, value)
    },
    mergeProps<T extends object>(props: T | (() => T)) {
      // Controls win over page props, as in the React examples
      return () => ({
        ...(typeof props === "function" ? props() : props),
        ...getTransformedControlValues(config, context),
      })
    },
  }

  return controls
}

export type UseControlsReturn<T extends ControlRecord = ControlRecord> = ReturnType<typeof useControls<T>>
