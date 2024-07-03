import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { UserDefinedContext } from "./steps.types"

export const props = createProps<UserDefinedContext>()([
  "count",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "onStepChange",
  "onStepComplete",
  "orientation",
  "skippable",
  "step",
])

export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)
