import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { CascaderProps } from "./cascader.types"

export const props = createProps<CascaderProps>()([
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
  "highlightTrigger",
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

export const splitProps = createSplitProps<Partial<CascaderProps>>(props)
