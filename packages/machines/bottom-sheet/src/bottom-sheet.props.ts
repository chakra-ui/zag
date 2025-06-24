import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { UserDefinedContext } from "./bottom-sheet.types"

export const props = createProps<UserDefinedContext>()([
  "id",
  "dir",
  "snapPoints",
  "snapIndex",
  "defaultSnapIndex",
  "onSnapPointChange",
  "modal",
  "open",
  "defaultOpen",
  "resizable",
  "onOpenChange",
  "closeThreshold",
  "getRootNode",
])

export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)
