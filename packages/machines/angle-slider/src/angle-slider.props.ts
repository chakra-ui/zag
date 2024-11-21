import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { UserDefinedContext } from "./angle-slider.types"

export const props = createProps<UserDefinedContext>()([
  "dir",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "invalid",
  "name",
  "onValueChange",
  "onValueChangeEnd",
  "readOnly",
  "step",
  "value",
])

export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)
