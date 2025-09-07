import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { BottomSheetProps } from "./bottom-sheet.types"

export const props = createProps<BottomSheetProps>()([
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
  "swipeVelocityThreshold",
  "closeThreshold",
  "preventDragOnScroll",
  "closeOnEscape",
  "closeOnInteractOutside",
  "onEscapeKeyDown",
  "onFocusOutside",
  "onInteractOutside",
  "onOpenChange",
  "onPointerDownOutside",
  "onRequestDismiss",
  "preventScroll",
  "restoreFocus",
  "role",
  "trapFocus",
  "defaultActiveSnapPoint",
  "activeSnapPoint",
  "onActiveSnapPointChange",
])

export const splitProps = createSplitProps<Partial<BottomSheetProps>>(props)
