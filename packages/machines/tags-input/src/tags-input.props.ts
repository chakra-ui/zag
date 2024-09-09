import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ItemProps, UserDefinedContext } from "./tags-input.types"

export const props = createProps<UserDefinedContext>()([
  "addOnPaste",
  "allowOverflow",
  "autoFocus",
  "blurBehavior",
  "delimiter",
  "dir",
  "disabled",
  "editable",
  "form",
  "getRootNode",
  "id",
  "ids",
  "inputValue",
  "invalid",
  "max",
  "maxLength",
  "name",
  "onFocusOutside",
  "onHighlightChange",
  "onInputValueChange",
  "onInteractOutside",
  "onPointerDownOutside",
  "onValueChange",
  "onValueInvalid",
  "required",
  "readOnly",
  "translations",
  "validate",
  "value",
])

export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)

export const itemProps = createProps<ItemProps>()(["index", "disabled", "value"])

export const splitItemProps = createSplitProps<ItemProps>(itemProps)
