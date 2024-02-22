import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ItemProps, UserDefinedContext } from "./tree-view.types"

export const props = createProps<UserDefinedContext>()([
  "dir",
  "expandedIds",
  "focusedId",
  "getRootNode",
  "id",
  "onExpandedChange",
  "onFocusChange",
  "onSelectionChange",
  "openOnClick",
  "selectedIds",
  "selectionMode",
])

export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)

export const itemProps = createProps<ItemProps>()(["depth", "id", "disabled"])

export const splitItemProps = createSplitProps<ItemProps>(itemProps)
