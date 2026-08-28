import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { FieldProps } from "./field.types"

export const props = createProps<FieldProps>()([
  "dir",
  "dirty",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "invalid",
  "onValidityChange",
  "readOnly",
  "required",
  "target",
  "touched",
  "validate",
  "validationMode",
])
export const splitProps = createSplitProps<Partial<FieldProps>>(props)
