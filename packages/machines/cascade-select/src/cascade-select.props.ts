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
  "getRootNode",
  "id",
  "ids",
  "invalid",
  "highlightTrigger",
  "form",
  "name",
  "loopFocus",
  "multiple",
  "onHighlightChange",
  "onOpenChange",
  "onValueChange",
  "open",
  "positioning",
  "readOnly",
  "required",
  "value",
  "highlightedValue",
  "scrollToIndexFn",
])

export const splitProps = createSplitProps<Partial<CascadeSelectProps>>(props)
