import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils/object"
import type { SwitchProps } from "./switch.types"

export const props = createProps<SwitchProps>()([
  "checked",
  "defaultChecked",
  "dir",
  "disabled",
  "form",
  "getRootNode",
  "id",
  "ids",
  "invalid",
  "label",
  "name",
  "onCheckedChange",
  "readOnly",
  "required",
  "value",
])

export const splitProps = createSplitProps<Partial<SwitchProps>>(props)
