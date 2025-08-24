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
  "closeThreshold",
  "closeOnEscape",
  "closeOnInteractOutside",
  "onEscapeKeyDown",
  "onFocusOutside",
  "onInteractOutside",
  "onOpenChange",
  "onPointerDownOutside",
  "restoreFocus",
  "role",
  "trapFocus",
])

export const splitProps = createSplitProps<Partial<BottomSheetProps>>(props)
