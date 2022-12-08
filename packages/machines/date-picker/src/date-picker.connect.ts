import { NormalizeProps, type PropTypes } from "@zag-js/types"
import { State, Send } from "./date-picker.types"
import { dom } from "./date-picker.dom"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  return {
    rootProps: normalize.element({}),
  }
}
