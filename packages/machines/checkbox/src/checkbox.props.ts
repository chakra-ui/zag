import { createProps } from "@zag-js/types"
import type { UserDefinedContext } from "./checkbox.types"

export const props = createProps<UserDefinedContext>()([
  "checked",
  "dir",
  "disabled",
  "form",
  "getRootNode",
  "id",
  "ids",
  "invalid",
  "name",
  "onCheckedChange",
  "required",
  "value",
])
