import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { BottomSheetProps } from "./bottom-sheet.types"

export const props = createProps<BottomSheetProps>()([
  "id",
  "dir",
  "open",
  "defaultOpen",
  "getRootNode",
  "snapPoints",
  "closeOnEscape",
  "closeOnInteractOutside",
  "onEscapeKeyDown",
  "onFocusOutside",
  "onInteractOutside",
  "onOpenChange",
  "onPointerDownOutside",
])

export const splitProps = createSplitProps<Partial<BottomSheetProps>>(props)
