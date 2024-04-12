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
  "value",
  "id",
  "hourSteps",
  "minuteSteps",
  "hourMax",
  "hourMin",
  "minuteMax",
  "minuteMin",
])
export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)
