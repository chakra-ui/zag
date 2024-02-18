import { createProps } from "@zag-js/types"
import type { IndicatorProps, UserDefinedContext } from "./clipboard.types"

export const props = createProps<UserDefinedContext>()([
  "getRootNode",
  "id",
  "ids",
  "value",
  "timeout",
  "onCopyStatusChange",
])

export const indicatorProps = createProps<IndicatorProps>()(["copied"])
