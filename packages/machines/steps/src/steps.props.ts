import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { StepsProps } from "./steps.types"

export const props = createProps<StepsProps>()([
  "count",
  "defaultStep",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "isStepSkippable",
  "isStepValid",
  "linear",
  "onStepChange",
  "onStepComplete",
  "onStepInvalid",
  "orientation",
  "step",
])

export const splitProps = createSplitProps<Partial<StepsProps>>(props)
