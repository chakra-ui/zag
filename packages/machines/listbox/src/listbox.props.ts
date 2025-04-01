import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ItemGroupLabelProps, ItemGroupProps, ItemProps, ListboxProps } from "./listbox.types"

export const props = createProps<ListboxProps>()([
  "collection",
  "dir",
  "disabled",
  "getRootNode",
  "highlightedValue",
  "id",
  "ids",
  "loopFocus",
  "selectionBehavior",
  "selectionMode",
  "onHighlightChange",
  "onValueChange",
  "selectOnHighlight",
  "scrollToIndexFn",
  "value",
  "defaultValue",
  "disallowSelectAll",
  "defaultHighlightedValue",
  "orientation",
])
export const splitProps = createSplitProps<Partial<ListboxProps>>(props)

export const itemProps = createProps<ItemProps>()(["item", "highlightOnHover"])
export const splitItemProps = createSplitProps<ItemProps>(itemProps)

export const itemGroupProps = createProps<ItemGroupProps>()(["id"])
export const splitItemGroupProps = createSplitProps<ItemGroupProps>(itemGroupProps)

export const itemGroupLabelProps = createProps<ItemGroupLabelProps>()(["htmlFor"])
export const splitItemGroupLabelProps = createSplitProps<ItemGroupLabelProps>(itemGroupLabelProps)
