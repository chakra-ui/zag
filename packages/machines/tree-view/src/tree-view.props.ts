import { createProps } from "@zag-js/types"
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

export const itemProps = createProps<ItemProps>()(["depth", "id", "disabled"])
