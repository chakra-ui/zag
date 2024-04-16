import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { UserDefinedContext } from "./time-picker.types"

export const props = createProps<UserDefinedContext>()([
  "placeholder",
  "disabled",
  "getRootNode",
  "dir",
  "positioning",
  "onValueChange",
  "onOpenChange",
  "ids",
  "open",
  "open.controlled",
  "value",
  "id",
  "min",
  "max",
  "steps",
  "withSeconds",
  "onFocusChange",
  "name",
  "readOnly",
])
export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)
