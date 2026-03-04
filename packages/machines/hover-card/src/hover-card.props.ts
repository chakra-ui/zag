import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { HoverCardProps } from "./hover-card.types"

export const props = createProps<HoverCardProps>()([
  "closeDelay",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "disabled",
  "onOpenChange",
  "defaultOpen",
  "open",
  "openDelay",
  "positioning",
  "onInteractOutside",
  "onPointerDownOutside",
  "onFocusOutside",
])

export const splitProps = createSplitProps<Partial<HoverCardProps>>(props)
