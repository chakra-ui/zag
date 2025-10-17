import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { TooltipProps } from "./tooltip.types"

export const props = createProps<TooltipProps>()([
  "activeTriggerValue",
  "aria-label",
  "closeDelay",
  "closeOnEscape",
  "closeOnPointerDown",
  "closeOnScroll",
  "closeOnClick",
  "defaultActiveTriggerValue",
  "defaultOpen",
  "dir",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "interactive",
  "onActiveTriggerChange",
  "onOpenChange",
  "open",
  "openDelay",
  "positioning",
])

export const splitProps = createSplitProps<Partial<TooltipProps>>(props)
