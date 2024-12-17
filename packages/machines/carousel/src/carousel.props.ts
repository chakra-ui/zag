import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { IndicatorProps, ItemProps, UserDefinedContext } from "./carousel.types"

export const props = createProps<UserDefinedContext>()([
  "dir",
  "getRootNode",
  "id",
  "ids",
  "loop",
  "snapIndex",
  "onSnapChange",
  "orientation",
  "slideCount",
  "slidesPerPage",
  "spacing",
  "padding",
  "scrollBy",
  "autoplay",
  "allowMouseDrag",
  "inViewThreshold",
  "translations",
  "snapType",
  "onDragStatusChange",
  "onAutoplayStatusChange",
])
export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)

export const indicatorProps = createProps<IndicatorProps>()(["index", "readOnly"])
export const splitIndicatorProps = createSplitProps<IndicatorProps>(indicatorProps)

export const itemProps = createProps<ItemProps>()(["index", "snapAlign"])
export const splitItemProps = createSplitProps<ItemProps>(itemProps)
