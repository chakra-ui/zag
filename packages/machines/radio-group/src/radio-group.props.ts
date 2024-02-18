import { createProps } from "@zag-js/types"
import type { ItemProps, UserDefinedContext } from "./radio-group.types"

export const props = createProps<UserDefinedContext>()([
  "dir",
  "disabled",
  "form",
  "getRootNode",
  "id",
  "ids",
  "name",
  "onValueChange",
  "orientation",
  "value",
])

export const itemProps = createProps<ItemProps>()(["value", "disabled", "invalid"])
