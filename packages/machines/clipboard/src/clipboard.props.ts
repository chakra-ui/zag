import { createProps } from "@zag-js/types"
import type { IndicatorProps, UserDefinedContext } from "./clipboard.types"
import { createSplitProps } from "@zag-js/utils"

export const props = createProps<UserDefinedContext>()([
  "getRootNode",
  "id",
  "ids",
  "value",
  "timeout",
  "onStatusChange",
])
export const contextProps = createSplitProps<UserDefinedContext>(props)

export const indicatorProps = createProps<IndicatorProps>()(["copied"])
export const splitIndicatorProps = createSplitProps<IndicatorProps>(indicatorProps)
