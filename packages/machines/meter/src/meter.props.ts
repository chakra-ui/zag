import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { MeterProps } from "./meter.types"

export const props = createProps<MeterProps>()([
  "defaultValue",
  "dir",
  "formatOptions",
  "getRootNode",
  "high",
  "id",
  "ids",
  "locale",
  "low",
  "max",
  "min",
  "onValueChange",
  "optimum",
  "orientation",
  "translations",
  "value",
])

export const splitProps = createSplitProps<Partial<MeterProps>>(props)
