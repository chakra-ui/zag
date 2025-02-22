import { createProps } from "@zag-js/types"
import type { IndicatorProps, ClipboardProps } from "./clipboard.types"
import { createSplitProps } from "@zag-js/utils"

export const props = createProps<ClipboardProps>()([
  "getRootNode",
  "id",
  "ids",
  "value",
  "defaultValue",
  "timeout",
  "onStatusChange",
  "onValueChange",
])
export const contextProps = createSplitProps<ClipboardProps>(props)

export const indicatorProps = createProps<IndicatorProps>()(["copied"])
export const splitIndicatorProps = createSplitProps<IndicatorProps>(indicatorProps)
