import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ItemGroupLabelProps, ItemGroupProps, ItemProps, UserDefinedContext } from "./combobox.types"

export const props = createProps<UserDefinedContext>()([
  "allowCustomValue",
  "autoFocus",
  "closeOnSelect",
  "dir",
  "disabled",
  "form",
  "getRootNode",
  "highlightedValue",
  "id",
  "ids",
  "inputBehavior",
  "collection",
  "inputValue",
  "invalid",
  "loop",
  "multiple",
  "name",
  "onFocusOutside",
  "onHighlightChange",
  "onInputValueChange",
  "onInteractOutside",
  "onOpenChange",
  "onOpenChange",
  "onPointerDownOutside",
  "onValueChange",
  "openOnClick",
  "placeholder",
  "positioning",
  "readOnly",
  "selectionBehavior",
  "selectOnBlur",
  "translations",
  "value",
])
export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)

export const itemGroupLabelProps = createProps<ItemGroupLabelProps>()(["htmlFor"])
export const splitItemGroupLabelProps = createSplitProps<ItemGroupLabelProps>(itemGroupLabelProps)

export const itemGroupProps = createProps<ItemGroupProps>()(["id"])
export const splitItemGroupProps = createSplitProps<ItemGroupProps>(itemGroupProps)

export const itemProps = createProps<ItemProps>()(["item"])
export const splitItemProps = createSplitProps<ItemProps>(itemProps)
