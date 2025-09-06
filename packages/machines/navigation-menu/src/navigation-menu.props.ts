import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { NavigationMenuProps } from "./navigation-menu.types"

export const props = createProps<NavigationMenuProps>()([
  "id",
  "dir",
  "getRootNode",
  "value",
  "defaultValue",
  "onValueChange",
  "openDelay",
  "closeDelay",
  "orientation",
  "ids",
  "disableClickTrigger",
  "disableHoverTrigger",
  "disablePointerLeaveClose",
])

export const splitProps = createSplitProps<Partial<NavigationMenuProps>>(props)
