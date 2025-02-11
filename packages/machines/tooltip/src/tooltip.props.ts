import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { TooltipProps } from "./tooltip.types"

export const props = createProps<TooltipProps>()([
  "aria-label",
  "closeDelay",
  "closeOnEscape",
  "closeOnPointerDown",
  "closeOnScroll",
  "closeOnClick",
  "dir",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "interactive",
  "onOpenChange",
  "defaultOpen",
  "open",
  "openDelay",
  "positioning",
])

export const splitProps = createSplitProps<Partial<TooltipProps>>(props)
