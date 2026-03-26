import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { DrawerProps } from "./drawer.types"

export const props = createProps<DrawerProps>()([
  "defaultTriggerValue",
  "id",
  "ids",
  "dir",
  "modal",
  "initialFocusEl",
  "finalFocusEl",
  "open",
  "defaultOpen",
  "getRootNode",
  "snapPoints",
  "swipeDirection",
  "snapToSequentialPoints",
  "swipeVelocityThreshold",
  "closeThreshold",
  "preventDragOnScroll",
  "closeOnEscape",
  "closeOnInteractOutside",
  "onEscapeKeyDown",
  "onFocusOutside",
  "onInteractOutside",
  "onOpenChange",
  "onTriggerValueChange",
  "onPointerDownOutside",
  "onRequestDismiss",
  "preventScroll",
  "restoreFocus",
  "role",
  "trapFocus",
  "defaultSnapPoint",
  "snapPoint",
  "onSnapPointChange",
  "stack",
  "triggerValue",
])

export const splitProps = createSplitProps<Partial<DrawerProps>>(props)
