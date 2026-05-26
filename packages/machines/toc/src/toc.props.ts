import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ItemProps, TocProps } from "./toc.types"

export const props = createProps<TocProps>()([
  "activeIds",
  "autoScroll",
  "defaultActiveIds",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "items",
  "onActiveChange",
  "rootMargin",
  "scrollBehavior",
  "scrollEl",
  "threshold",
])

export const splitProps = createSplitProps<Partial<TocProps>>(props)

export const itemProps = createProps<ItemProps>()(["item"])
export const splitItemProps = createSplitProps<ItemProps>(itemProps)
