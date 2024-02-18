import { createProps } from "@zag-js/types"
import type { ItemProps, UserDefinedContext } from "./rating-group.types"

export const props = createProps<UserDefinedContext>()([
  "allowHalf",
  "autoFocus",
  "count",
  "dir",
  "disabled",
  "form",
  "getRootNode",
  "id",
  "ids",
  "name",
  "onHoverChange",
  "onValueChange",
  "readOnly",
  "translations",
  "value",
])

export const itemProps = createProps<ItemProps>()(["index"])
