import { createProps } from "@zag-js/types"
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

export const indicatorProps = createProps<IndicatorProps>()(["index", "readOnly"])
