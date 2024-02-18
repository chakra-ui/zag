import { createProps } from "@zag-js/types"
import type { UserDefinedContext } from "./pin-input.types"

export const props = createProps<UserDefinedContext>()([
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
  "pattern",
  "placeholder",
  "selectOnFocus",
  "translations",
  "type",
  "value",
])
