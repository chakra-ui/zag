import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { UserDefinedContext } from "./time-picker.types"

export const props = createProps<UserDefinedContext>()([
  "dir",
  "disabled",
  "disableLayer",
  "getRootNode",
  "id",
  "ids",
  "locale",
  "max",
  "min",
  "name",
  "onFocusChange",
  "onOpenChange",
  "onValueChange",
  "open.controlled",
  "open",
  "placeholder",
  "positioning",
  "readOnly",
  "steps",
  "value",
  "allowSeconds",
])

export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)
