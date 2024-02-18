import { createProps } from "@zag-js/types"
import type { UserDefinedContext } from "./switch.types"

export const props = createProps<UserDefinedContext>()([
  "checked",
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
  "required",
  "value",
])
