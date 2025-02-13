import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { AccordionProps, ItemProps } from "./accordion.types"

export const props = createProps<AccordionProps>()([
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
  "defaultValue",
])
export const splitProps = createSplitProps<Partial<AccordionProps>>(props)

export const itemProps = createProps<ItemProps>()(["value", "disabled"])
export const splitItemProps = createSplitProps<ItemProps>(itemProps)
