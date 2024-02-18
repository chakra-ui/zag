import { createProps } from "@zag-js/types"
import type { UserDefinedContext } from "./collapsible.types"

export const props = createProps<UserDefinedContext>()([
  "dir",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "onOpenChange",
  "open.controlled",
  "open",
])
