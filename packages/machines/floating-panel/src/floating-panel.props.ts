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
  "gridSize",
  "id",
  "ids",
  "lockAspectRatio",
  "maxSize",
  "minSize",
  "onPositionChange",
  "onPositionChangeEnd",
  "onOpenChange",
  "onStageChange",
  "onSizeChange",
  "onSizeChangeEnd",
  "open",
  "position",
  "preserveOnClose",
  "resizable",
  "size",
])

export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)
