import type { ElementAttrs, HTMLAttributes, NativeElements } from "@vue/runtime-dom"

export type PropTypes = {
  button: NativeElements["button"]
  input: NativeElements["input"]
  output: NativeElements["output"]
  textarea: NativeElements["textarea"]
  label: NativeElements["label"]
  p: NativeElements["p"]
  ul: NativeElements["ul"]
  ol: NativeElements["ol"]
  li: NativeElements["li"]
  element: ElementAttrs<HTMLAttributes>
}
