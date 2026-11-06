import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { PinInputProps } from "./pin-input.types"

export const props = createProps<PinInputProps>()([
  "autoFocus",
  "autoSubmit",
  "count",
  "defaultValue",
  "dir",
  "disabled",
  "form",
  "getRootNode",
  "id",
  "ids",
  "invalid",
  "mask",
  "name",
  "normalizeValue",
  "onValueChange",
  "onValueComplete",
  "onValueInvalid",
  "otp",
  "pattern",
  "placeholder",
  "readOnly",
  "required",
  "translations",
  "type",
  "value",
])

export const splitProps = createSplitProps<Partial<PinInputProps>>(props)
