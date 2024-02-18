import { createProps } from "@zag-js/types"
import type { ItemProps, UserDefinedContext } from "./toggle-group.types"

export const props = createProps<UserDefinedContext>()([
  "dir",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "loop",
  "multiple",
  "onValueChange",
  "orientation",
  "rovingFocus",
  "value",
])

export const itemProps = createProps<ItemProps>()(["value", "disabled"])
