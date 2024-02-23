import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { IndicatorProps, UserDefinedContext } from "./carousel.types"

export const props = createProps<UserDefinedContext>()([
  "align",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "index",
  "loop",
  "onIndexChange",
  "orientation",
  "slidesPerView",
  "spacing",
])
export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)

export const indicatorProps = createProps<IndicatorProps>()(["index", "readOnly"])
export const splitIndicatorProps = createSplitProps<IndicatorProps>(indicatorProps)
