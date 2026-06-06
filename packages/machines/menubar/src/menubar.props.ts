import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { MenubarProps } from "./menubar.types"

export const props = createProps<MenubarProps>()([
  "dir",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "loopFocus",
  "orientation",
])

export const splitProps = createSplitProps<Partial<MenubarProps>>(props)
