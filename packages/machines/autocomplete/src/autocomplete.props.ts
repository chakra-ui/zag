import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils/object"
import type { AutocompleteProps, ItemGroupLabelProps, ItemGroupProps, ItemProps } from "./autocomplete.types"

export const props = createProps<AutocompleteProps>()([
  "autoFocus",
  "autoHighlight",
  "collection",
  "defaultHighlightedValue",
  "defaultOpen",
  "defaultValue",
  "dir",
  "disabled",
  "form",
  "getRootNode",
  "highlightedValue",
  "id",
  "ids",
  "invalid",
  "loading",
  "loopFocus",
  "mode",
  "name",
  "navigate",
  "onFocusOutside",
  "onHighlightChange",
  "onInteractOutside",
  "onOpenChange",
  "onPointerDownOutside",
  "onSelect",
  "onValueChange",
  "open",
  "openOnChange",
  "openOnClick",
  "openOnKeyPress",
  "pageSize",
  "placeholder",
  "positioning",
  "readOnly",
  "required",
  "scrollToIndexFn",
  "submitOnSelect",
  "translations",
  "value",
])
export const splitProps = createSplitProps<Partial<AutocompleteProps>>(props)

export const itemProps = createProps<ItemProps>()(["item", "persistFocus"])
export const splitItemProps = createSplitProps<ItemProps>(itemProps)

export const itemGroupProps = createProps<ItemGroupProps>()(["id"])
export const splitItemGroupProps = createSplitProps<ItemGroupProps>(itemGroupProps)

export const itemGroupLabelProps = createProps<ItemGroupLabelProps>()(["htmlFor"])
export const splitItemGroupLabelProps = createSplitProps<ItemGroupLabelProps>(itemGroupLabelProps)
