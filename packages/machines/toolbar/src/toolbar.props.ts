import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ItemProps, ToolbarProps } from "./toolbar.types"

export const props = createProps<ToolbarProps>()([
  "dir",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "loopFocus",
  "orientation",
])

export const splitProps = createSplitProps<Partial<ToolbarProps>>(props)

export const itemProps = createProps<ItemProps>()(["value", "disabled", "focusableWhenDisabled"])

export const splitItemProps = createSplitProps<ItemProps>(itemProps)
