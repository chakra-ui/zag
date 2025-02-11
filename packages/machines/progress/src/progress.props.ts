import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ProgressProps } from "./progress.types"

export const props = createProps<ProgressProps>()([
  "dir",
  "getRootNode",
  "id",
  "ids",
  "max",
  "min",
  "orientation",
  "translations",
  "value",
  "onValueChange",
  "defaultValue",
])

export const splitProps = createSplitProps<Partial<ProgressProps>>(props)
