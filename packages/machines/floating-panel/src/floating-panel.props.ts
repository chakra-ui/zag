import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { UserDefinedContext } from "./floating-panel.types"

export const props = createProps<UserDefinedContext>()([
  "closeOnEscape",
  "dir",
  "disabled",
  "draggable",
  "getBoundaryEl",
  "getRootNode",
  "id",
  "lockAspectRatio",
  "onDrag",
  "onDragEnd",
  "onOpenChange",
  "onResize",
  "onResizeEnd",
  "open",
  "position",
  "resizable",
  "size",
])

export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)
