import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type {
  CellProps,
  GridListProps,
  ItemCheckboxProps,
  ItemGroupLabelProps,
  ItemGroupProps,
  ItemProps,
} from "./gridlist.types"

export const props = createProps<GridListProps>()([
  "autoFocus",
  "collection",
  "defaultFocusedValue",
  "defaultValue",
  "deselectable",
  "dir",
  "disabledBehavior",
  "disabled",
  "disallowEmptySelection",
  "escapeKeyBehavior",
  "focusedValue",
  "getRootNode",
  "id",
  "ids",
  "keyboardNavigationBehavior",
  "loopFocus",
  "onAction",
  "onFocusChange",
  "onNavigate",
  "onValueChange",
  "pageSize",
  "scrollToIndexFn",
  "selectionBehavior",
  "selectionMode",
  "typeahead",
  "value",
])
export const splitProps = createSplitProps<GridListProps>(props)

export const itemProps = createProps<ItemProps>()(["item", "href", "target", "rel", "focusOnHover"])
export const splitItemProps = createSplitProps<ItemProps>(itemProps)

export const itemGroupProps = createProps<ItemGroupProps>()(["id"])
export const splitItemGroupProps = createSplitProps<ItemGroupProps>(itemGroupProps)

export const itemGroupLabelProps = createProps<ItemGroupLabelProps>()(["htmlFor"])
export const splitItemGroupLabelProps = createSplitProps<ItemGroupLabelProps>(itemGroupLabelProps)

export const cellProps = createProps<CellProps>()(["index"])
export const splitCellProps = createSplitProps<CellProps>(cellProps)

export const itemCheckboxProps = createProps<ItemCheckboxProps>()(["item"])
export const splitItemCheckboxProps = createSplitProps<ItemCheckboxProps>(itemCheckboxProps)
