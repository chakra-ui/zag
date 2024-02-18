import { createProps } from "@zag-js/types"
import type { UserDefinedContext } from "./hover-card.types"

export const props = createProps<UserDefinedContext>()([
  "closeDelay",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "onOpenChange",
  "open.controlled",
  "open",
  "openDelay",
  "positioning",
])
