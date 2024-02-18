import { createProps } from "@zag-js/types"
import type { EllipsisProps, ItemProps, UserDefinedContext } from "./pagination.types"

export const props = createProps<UserDefinedContext>()([
  "count",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "onPageChange",
  "page",
  "pageSize",
  "siblingCount",
  "translations",
  "type",
])

export const itemProps = createProps<ItemProps>()(["value", "type"])

export const ellipsisProps = createProps<EllipsisProps>()(["index"])
