import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { IndicatorProps, UserDefinedContext } from "./carousel.types"

export const props = createProps<UserDefinedContext>()([
  "dir",
  "getRootNode",
  "id",
  "ids",
  "loop",
  "snapIndex",
  "onSnapChange",
  "orientation",
  "slidesPerView",
  "spacing",
  "padding",
  "scrollBy",
  "autoplay",
  "draggable",
  "inViewThreshold",
  "translations",
])
export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)

export const indicatorProps = createProps<IndicatorProps>()(["index", "readOnly"])
export const splitIndicatorProps = createSplitProps<IndicatorProps>(indicatorProps)
