import type { NativeElements } from "vue"

export type PropTypes = NativeElements & {
  element: NativeElements["div"]
}
