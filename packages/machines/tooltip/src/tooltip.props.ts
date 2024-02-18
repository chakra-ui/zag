import { createProps } from "@zag-js/types"
import type { UserDefinedContext } from "./tooltip.types"

export const props = createProps<UserDefinedContext>()([
  "aria-label",
  "closeDelay",
  "closeOnEsc",
  "closeOnPointerDown",
  "dir",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "interactive",
  "onOpenChange",
  "open.controlled",
  "open",
  "openDelay",
  "positioning",
])
