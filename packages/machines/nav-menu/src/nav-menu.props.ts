import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { UserDefinedContext } from "./nav-menu.types"

export const props = createProps<UserDefinedContext>()([
  "activeId",
  "activeLinkId",
  "dir",
  "getRootNode",
  "highlightedLinkId",
  "id",
  "ids",
  "onFocusOutside",
  "onInteractOutside",
  "onPointerDownOutside",
  "orientation",
])
export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)
