import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { UserDefinedContext } from "./cascader.types"

export const props = createProps<UserDefinedContext>()([
  "closeOnSelect",
  "collection",
  "dir",
  "disabled",
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
  "open.controlled",
  "open",
  "positioning",
  "required",
  "readOnly",
  "value",
  "expandTrigger",
])
export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)
