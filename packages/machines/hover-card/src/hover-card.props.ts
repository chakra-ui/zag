import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { HoverCardProps } from "./hover-card.types"

export const props = createProps<HoverCardProps>()([
  "closeDelay",
  "defaultOpen",
  "defaultTriggerValue",
  "dir",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "onFocusOutside",
  "onInteractOutside",
  "onOpenChange",
  "onPointerDownOutside",
  "onTriggerValueChange",
  "open",
  "openDelay",
  "positioning",
  "triggerValue",
])

export const splitProps = createSplitProps<Partial<HoverCardProps>>(props)
