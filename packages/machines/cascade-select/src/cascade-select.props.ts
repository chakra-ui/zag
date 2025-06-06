import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { CascadeSelectProps } from "./cascade-select.types"

export const props = createProps<CascadeSelectProps>()([
  "allowParentSelection",
  "closeOnSelect",
  "collection",
  "defaultOpen",
  "defaultValue",
  "dir",
  "disabled",
  "formatValue",
  "getRootNode",
  "highlightedPath",
  "id",
  "ids",
  "invalid",
  "isItemDisabled",
  "loop",
  "multiple",
  "onHighlightChange",
  "onOpenChange",
  "onValueChange",
  "open",
  "placeholder",
  "positioning",
  "readOnly",
  "required",
  "value",
])

export const splitProps = createSplitProps<Partial<CascadeSelectProps>>(props)
