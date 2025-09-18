import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { DialogProps } from "./dialog.types"

export const props = createProps<DialogProps>()([
  "aria-label",
  "closeOnEscape",
  "closeOnInteractOutside",
  "dir",
  "finalFocusEl",
  "getRootNode",
  "getRootNode",
  "id",
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
  "preventScroll",
  "restoreFocus",
  "role",
  "trapFocus",
])

export const splitProps = createSplitProps<Partial<DialogProps>>(props)
