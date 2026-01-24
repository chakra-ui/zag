import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { TooltipProps } from "./tooltip.types"

export const props = createProps<TooltipProps>()([
  "aria-label",
  "closeDelay",
  "closeOnClick",
  "closeOnEscape",
  "closeOnPointerDown",
  "closeOnScroll",
  "defaultOpen",
  "defaultTriggerValue",
  "dir",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "interactive",
  "onOpenChange",
  "onTriggerValueChange",
  "open",
  "openDelay",
  "positioning",
  "triggerValue",
])

export const splitProps = createSplitProps<Partial<TooltipProps>>(props)
