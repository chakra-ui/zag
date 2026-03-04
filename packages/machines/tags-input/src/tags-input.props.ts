import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ItemProps, TagsInputProps } from "./tags-input.types"

export const props = createProps<TagsInputProps>()([
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
  "placeholder",
  "required",
  "readOnly",
  "translations",
  "validate",
  "value",
  "defaultValue",
  "defaultInputValue",
])

export const splitProps = createSplitProps<Partial<TagsInputProps>>(props)

export const itemProps = createProps<ItemProps>()(["index", "disabled", "value"])

export const splitItemProps = createSplitProps<ItemProps>(itemProps)
