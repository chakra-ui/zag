import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { NodeProps, TreeViewProps } from "./tree-view.types"

export const props = createProps<TreeViewProps>()([
  "ids",
  "collection",
  "dir",
  "expandedValue",
  "expandOnClick",
  "defaultFocusedValue",
  "focusedValue",
  "getRootNode",
  "id",
  "onExpandedChange",
  "onFocusChange",
  "onSelectionChange",
  "checkedValue",
  "selectedValue",
  "selectionMode",
  "typeahead",
  "defaultExpandedValue",
  "defaultSelectedValue",
  "defaultCheckedValue",
  "onCheckedChange",
  "onLoadChildrenComplete",
  "onLoadChildrenError",
  "loadChildren",
  "canRename",
  "onRenameStart",
  "onBeforeRename",
  "onRenameComplete",
  "scrollToIndexFn",
])

export const splitProps = createSplitProps<Partial<TreeViewProps>>(props)

export const itemProps = createProps<NodeProps>()(["node", "indexPath"])

export const splitItemProps = createSplitProps<NodeProps>(itemProps)
