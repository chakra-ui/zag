import { createProps } from "@zag-js/types"
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
  "onSelect",
  "onValueChange",
  "open",
  "open.controlled",
  "positioning",
  "value",
])

export const itemProps = createProps<ItemProps>()(["closeOnSelect", "disabled", "id", "valueText"])

export const itemGroupLabelProps = createProps<ItemGroupLabelProps>()(["htmlFor"])

export const itemGroupProps = createProps<ItemGroupProps>()(["id"])

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
