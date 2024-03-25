import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ItemGroupLabelProps, ItemGroupProps, ItemProps, OptionItemProps, UserDefinedContext } from "./menu.types"

export const props = createProps<UserDefinedContext>()([
  "anchorPoint",
  "aria-label",
  "closeOnSelect",
  "dir",
  "getRootNode",
  "highlightedId",
  "id",
  "ids",
  "loop",
  "onFocusOutside",
  "onInteractOutside",
  "onOpenChange",
  "onPointerDownOutside",
  "onEscapeKeyDown",
  "onSelect",
  "onValueChange",
  "open",
  "open.controlled",
  "positioning",
  "value",
])
export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)

export const itemProps = createProps<ItemProps>()(["closeOnSelect", "disabled", "id", "valueText"])
export const splitItemProps = createSplitProps<ItemProps>(itemProps)

export const itemGroupLabelProps = createProps<ItemGroupLabelProps>()(["htmlFor"])
export const splitItemGroupLabelProps = createSplitProps<ItemGroupLabelProps>(itemGroupLabelProps)

export const itemGroupProps = createProps<ItemGroupProps>()(["id"])
export const splitItemGroupProps = createSplitProps<ItemGroupProps>(itemGroupProps)

export const optionItemProps = createProps<OptionItemProps>()([
  "id",
  "disabled",
  "valueText",
  "closeOnSelect",
  "name",
  "type",
  "value",
  "onCheckedChange",
])
export const splitOptionItemProps = createSplitProps<OptionItemProps>(optionItemProps)
