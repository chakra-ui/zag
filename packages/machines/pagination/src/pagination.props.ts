import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { EllipsisProps, ItemProps, UserDefinedContext } from "./pagination.types"

export const props = createProps<UserDefinedContext>()([
  "count",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "onPageChange",
  "onPageSizeChange",
  "page",
  "pageSize",
  "siblingCount",
  "translations",
  "type",
])
export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)

export const itemProps = createProps<ItemProps>()(["value", "type"])
export const splitItemProps = createSplitProps<ItemProps>(itemProps)

export const ellipsisProps = createProps<EllipsisProps>()(["index"])
export const splitEllipsisProps = createSplitProps<EllipsisProps>(ellipsisProps)
