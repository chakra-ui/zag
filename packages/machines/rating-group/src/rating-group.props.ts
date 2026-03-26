import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ItemProps, RatingGroupProps } from "./rating-group.types"

export const props = createProps<RatingGroupProps>()([
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
  "required",
  "readOnly",
  "translations",
  "value",
  "defaultValue",
])
export const splitProps = createSplitProps<Partial<RatingGroupProps>>(props)

export const itemProps = createProps<ItemProps>()(["index"])
export const splitItemProps = createSplitProps<ItemProps>(itemProps)
