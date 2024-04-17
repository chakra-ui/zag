import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ItemGroupLabelProps, ItemGroupProps, ItemProps, UserDefinedContext } from "./combobox.types"

export const props = createProps<UserDefinedContext>()([
  "allowCustomValue",
  "autoFocus",
  "closeOnSelect",
  "collection",
  "dir",
  "disabled",
  "form",
  "getRootNode",
  "getSelectionValue",
  "highlightedValue",
  "id",
  "ids",
  "inputBehavior",
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
  "open.controlled",
  "open",
  "openOnClick",
  "openOnChange",
  "openOnKeyPress",
  "placeholder",
  "positioning",
  "readOnly",
  "scrollToIndexFn",
  "selectionBehavior",
  "translations",
  "triggerOnly",
  "value",
])
export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)

export const itemGroupLabelProps = createProps<ItemGroupLabelProps>()(["htmlFor"])
export const splitItemGroupLabelProps = createSplitProps<ItemGroupLabelProps>(itemGroupLabelProps)

export const itemGroupProps = createProps<ItemGroupProps>()(["id"])
export const splitItemGroupProps = createSplitProps<ItemGroupProps>(itemGroupProps)

export const itemProps = createProps<ItemProps>()(["item"])
export const splitItemProps = createSplitProps<ItemProps>(itemProps)
