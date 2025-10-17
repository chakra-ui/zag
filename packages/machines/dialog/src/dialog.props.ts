import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { DialogProps } from "./dialog.types"

export const props = createProps<DialogProps>()([
  "activeTriggerValue",
  "aria-label",
  "closeOnEscape",
  "closeOnInteractOutside",
  "defaultActiveTriggerValue",
  "defaultOpen",
  "dir",
  "finalFocusEl",
  "getRootNode",
  "getRootNode",
  "id",
  "id",
  "ids",
  "initialFocusEl",
  "modal",
  "onActiveTriggerChange",
  "onEscapeKeyDown",
  "onFocusOutside",
  "onInteractOutside",
  "onOpenChange",
  "onPointerDownOutside",
  "onRequestDismiss",
  "open",
  "persistentElements",
  "preventScroll",
  "restoreFocus",
  "role",
  "trapFocus",
])

export const splitProps = createSplitProps<Partial<DialogProps>>(props)
