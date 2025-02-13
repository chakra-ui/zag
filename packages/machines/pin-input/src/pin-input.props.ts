import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { PinInputProps } from "./pin-input.types"

export const props = createProps<PinInputProps>()([
  "autoFocus",
  "blurOnComplete",
  "dir",
  "disabled",
  "form",
  "getRootNode",
  "id",
  "ids",
  "invalid",
  "mask",
  "name",
  "onValueChange",
  "onValueComplete",
  "onValueInvalid",
  "otp",
  "readOnly",
  "pattern",
  "placeholder",
  "required",
  "selectOnFocus",
  "translations",
  "type",
  "value",
  "defaultValue",
])

export const splitProps = createSplitProps<Partial<PinInputProps>>(props)
