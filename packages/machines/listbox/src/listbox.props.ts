import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ItemGroupLabelProps, ItemGroupProps, ItemProps, ListboxProps } from "./listbox.types"

export const props = createProps<ListboxProps>()([
  "collection",
  "defaultHighlightedValue",
  "defaultValue",
  "dir",
  "disabled",
  "deselectable",
  "disallowSelectAll",
  "getRootNode",
  "highlightedValue",
  "id",
  "ids",
  "loopFocus",
  "onHighlightChange",
  "onSelect",
  "onValueChange",
  "orientation",
  "scrollToIndexFn",
  "selectionMode",
  "selectOnHighlight",
  "typeahead",
  "value",
])
export const splitProps = createSplitProps<ListboxProps>(props)

export const itemProps = createProps<ItemProps>()(["item", "highlightOnHover"])
export const splitItemProps = createSplitProps<ItemProps>(itemProps)

export const itemGroupProps = createProps<ItemGroupProps>()(["id"])
export const splitItemGroupProps = createSplitProps<ItemGroupProps>(itemGroupProps)

export const itemGroupLabelProps = createProps<ItemGroupLabelProps>()(["htmlFor"])
export const splitItemGroupLabelProps = createSplitProps<ItemGroupLabelProps>(itemGroupLabelProps)
