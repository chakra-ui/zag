import { createProps } from "@zag-js/types"
import type { UserDefinedContext } from "./popover.types"

export const props = createProps<UserDefinedContext>()([
  "autoFocus",
  "closeOnEsc",
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
  "open.controlled",
  "open",
  "portalled",
  "positioning",
])
