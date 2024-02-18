import { createProps } from "@zag-js/types"
import type { ItemProps, UserDefinedContext } from "./accordion.types"

export const props = createProps<UserDefinedContext>()([
  "collapsible",
  "dir",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "multiple",
  "onFocusChange",
  "onValueChange",
  "orientation",
  "value",
])

export const itemProps = createProps<ItemProps>()(["value", "disabled"])
