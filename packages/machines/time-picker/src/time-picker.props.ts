import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { TimePickerProps } from "./time-picker.types"

export const props = createProps<TimePickerProps>()([
  "hourFormat",
  "dir",
  "disabled",
  "disableLayer",
  "getRootNode",
  "id",
  "ids",
  "locale",
  "max",
  "min",
  "name",
  "onFocusChange",
  "onOpenChange",
  "onValueChange",
  "open",
  "placeholder",
  "positioning",
  "readOnly",
  "steps",
  "value",
  "allowSeconds",
  "defaultValue",
  "defaultOpen",
])

export const splitProps = createSplitProps<TimePickerProps>(props)
