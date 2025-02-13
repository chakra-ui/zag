import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ItemGroupLabelProps, ItemGroupProps, ItemProps, SelectProps } from "./select.types"

export const props = createProps<SelectProps>()([
  "closeOnSelect",
  "collection",
  "dir",
  "disabled",
  "deselectable",
  "form",
  "getRootNode",
  "highlightedValue",
  "id",
  "ids",
  "invalid",
  "loopFocus",
  "multiple",
  "name",
  "onFocusOutside",
  "onHighlightChange",
  "onInteractOutside",
  "onOpenChange",
  "onPointerDownOutside",
  "onValueChange",
  "defaultOpen",
  "open",
  "composite",
  "positioning",
  "required",
  "readOnly",
  "scrollToIndexFn",
  "value",
  "defaultValue",
  "defaultHighlightedValue",
])
export const splitProps = createSplitProps<Partial<SelectProps>>(props)

export const itemProps = createProps<ItemProps>()(["item", "persistFocus"])
export const splitItemProps = createSplitProps<ItemProps>(itemProps)

export const itemGroupProps = createProps<ItemGroupProps>()(["id"])
export const splitItemGroupProps = createSplitProps<ItemGroupProps>(itemGroupProps)

export const itemGroupLabelProps = createProps<ItemGroupLabelProps>()(["htmlFor"])
export const splitItemGroupLabelProps = createSplitProps<ItemGroupLabelProps>(itemGroupLabelProps)
