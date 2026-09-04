import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ItemProps, WheelPickerProps } from "./wheel-picker.types"

export const props = createProps<WheelPickerProps>()([
  "aria-label",
  "aria-labelledby",
  "collection",
  "defaultValue",
  "dir",
  "disabled",
  "dragSensitivity",
  "form",
  "getRootNode",
  "id",
  "ids",
  "infinite",
  "invalid",
  "name",
  "onValueChange",
  "onValueChangeEnd",
  "optionItemHeight",
  "readOnly",
  "required",
  "scrollSensitivity",
  "value",
  "visibleCount",
])

export const splitProps = createSplitProps<Partial<WheelPickerProps>>(props)

export const itemProps = createProps<ItemProps>()(["index", "item"])
export const splitItemProps = createSplitProps<ItemProps>(itemProps)
