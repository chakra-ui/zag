import { createProps } from "@zag-js/types"
import type { ItemGroupLabelProps, ItemGroupProps, ItemProps, UserDefinedContext } from "./select.types"

export const props = createProps<UserDefinedContext>()([
  "closeOnSelect",
  "dir",
  "disabled",
  "form",
  "getRootNode",
  "highlightedValue",
  "id",
  "ids",
  "invalid",
  "collection",
  "loop",
  "multiple",
  "name",
  "onFocusOutside",
  "onHighlightChange",
  "onInteractOutside",
  "onOpenChange",
  "onPointerDownOutside",
  "onValueChange",
  "open",
  "open.controlled",
  "positioning",
  "readOnly",
  "selectOnBlur",
  "value",
])

export const itemProps = createProps<ItemProps>()(["item"])

export const itemGroupProps = createProps<ItemGroupProps>()(["id"])

export const itemGroupLabelProps = createProps<ItemGroupLabelProps>()(["htmlFor"])
