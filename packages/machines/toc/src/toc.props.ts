import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ItemProps, LinkProps, TocProps } from "./toc.types"

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
  "getScrollEl",
  "scrollOffset",
  "threshold",
])

export const splitProps = createSplitProps<Partial<TocProps>>(props)

export const itemProps = createProps<ItemProps>()(["value"])
export const splitItemProps = createSplitProps<ItemProps>(itemProps)

export const linkProps = createProps<LinkProps>()(["value"])
export const splitLinkProps = createSplitProps<LinkProps>(linkProps)
