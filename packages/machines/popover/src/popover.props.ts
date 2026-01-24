import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { PopoverProps } from "./popover.types"

export const props = createProps<PopoverProps>()([
  "autoFocus",
  "closeOnEscape",
  "closeOnInteractOutside",
  "defaultOpen",
  "defaultTriggerValue",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "initialFocusEl",
  "modal",
  "onEscapeKeyDown",
  "onFocusOutside",
  "onInteractOutside",
  "onOpenChange",
  "onPointerDownOutside",
  "onTriggerValueChange",
  "onRequestDismiss",
  "open",
  "persistentElements",
  "portalled",
  "positioning",
  "triggerValue",
])

export const splitProps = createSplitProps<Partial<PopoverProps>>(props)
