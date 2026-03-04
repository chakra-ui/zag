import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { PopoverProps } from "./popover.types"

export const props = createProps<PopoverProps>()([
  "autoFocus",
  "closeOnEscape",
  "closeOnInteractOutside",
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
  "onRequestDismiss",
  "defaultOpen",
  "open",
  "persistentElements",
  "portalled",
  "positioning",
])

export const splitProps = createSplitProps<Partial<PopoverProps>>(props)
