import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { CascadeSelectProps } from "./cascade-select.types"

export const props = createProps<CascadeSelectProps>()([
  "allowParentSelection",
  "closeOnSelect",
  "collection",
  "defaultOpen",
  "defaultValue",
  "defaultHighlightedValue",
  "dir",
  "disabled",
  "formatValue",
  "form",
  "getRootNode",
  "highlightedValue",
  "highlightTrigger",
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
  "open",
  "positioning",
  "readOnly",
  "required",
  "scrollToIndexFn",
  "value",
])

export const splitProps = createSplitProps<Partial<CascadeSelectProps>>(props)
