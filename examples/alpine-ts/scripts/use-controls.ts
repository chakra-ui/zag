import { getControlDefaults, getTransformedControlValues, type ControlRecord } from "@zag-js/shared"

export function useControls<T extends ControlRecord>(config: T) {
  return () => ({
    state: getControlDefaults(config),
    get context() {
      return getTransformedControlValues(config, this.state)
    },
  })
}
