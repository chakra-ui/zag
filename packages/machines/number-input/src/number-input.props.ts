import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { NumberInputProps } from "./number-input.types"

export const props = createProps<NumberInputProps>()([
  "allowMouseWheel",
  "allowOverflow",
  "clampValueOnBlur",
  "dir",
  "disabled",
  "focusInputOnChange",
  "form",
  "formatOptions",
  "getRootNode",
  "id",
  "ids",
  "inputMode",
  "invalid",
  "locale",
  "max",
  "min",
  "name",
  "onFocusChange",
  "onValueChange",
  "onValueCommit",
  "onValueInvalid",
  "pattern",
  "required",
  "readOnly",
  "spinOnPress",
  "step",
  "translations",
  "value",
  "defaultValue",
])
export const splitProps = createSplitProps<Partial<NumberInputProps>>(props)
