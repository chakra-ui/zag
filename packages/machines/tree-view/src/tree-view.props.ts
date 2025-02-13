import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { NodeProps, TreeViewProps } from "./tree-view.types"

export const props = createProps<TreeViewProps>()([
  "ids",
  "collection",
  "dir",
  "expandedValue",
  "expandOnClick",
  "focusedValue",
  "getRootNode",
  "id",
  "onExpandedChange",
  "onFocusChange",
  "onSelectionChange",
  "selectedValue",
  "selectionMode",
  "typeahead",
  "defaultExpandedValue",
  "defaultSelectedValue",
])

export const splitProps = createSplitProps<Partial<TreeViewProps>>(props)

export const itemProps = createProps<NodeProps>()(["node", "indexPath"])

export const splitItemProps = createSplitProps<NodeProps>(itemProps)
