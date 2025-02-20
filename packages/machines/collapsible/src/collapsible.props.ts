import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { CollapsibleProps } from "./collapsible.types"

export const props = createProps<CollapsibleProps>()([
  "dir",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "onExitComplete",
  "onOpenChange",
  "defaultOpen",
  "open",
])
export const splitProps = createSplitProps<Partial<CollapsibleProps>>(props)
