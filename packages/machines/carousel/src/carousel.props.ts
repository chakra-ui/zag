import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { IndicatorProps, ItemProps, CarouselProps } from "./carousel.types"

export const props = createProps<CarouselProps>()([
  "dir",
  "getRootNode",
  "id",
  "ids",
  "loop",
  "page",
  "defaultPage",
  "onPageChange",
  "orientation",
  "slideCount",
  "slidesPerPage",
  "slidesPerMove",
  "spacing",
  "padding",
  "autoplay",
  "allowMouseDrag",
  "inViewThreshold",
  "translations",
  "snapType",
  "onDragStatusChange",
  "onAutoplayStatusChange",
])
export const splitProps = createSplitProps<Partial<CarouselProps>>(props)

export const indicatorProps = createProps<IndicatorProps>()(["index", "readOnly"])
export const splitIndicatorProps = createSplitProps<IndicatorProps>(indicatorProps)

export const itemProps = createProps<ItemProps>()(["index", "snapAlign"])
export const splitItemProps = createSplitProps<ItemProps>(itemProps)
