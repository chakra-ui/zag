import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { FloatingPanelProps } from "./floating-panel.types"

export const props = createProps<FloatingPanelProps>()([
  "allowOverflow",
  "closeOnEscape",
  "dir",
  "disabled",
  "draggable",
  "getAnchorPosition",
  "getBoundaryEl",
  "getRootNode",
  "gridSize",
  "id",
  "ids",
  "lockAspectRatio",
  "maxSize",
  "minSize",
  "onOpenChange",
  "onPositionChange",
  "onPositionChangeEnd",
  "onSizeChange",
  "onSizeChangeEnd",
  "onStageChange",
  "open",
  "persistRect",
  "position",
  "resizable",
  "strategy",
  "size",
  "defaultSize",
  "defaultPosition",
  "defaultOpen",
])

export const splitProps = createSplitProps<Partial<FloatingPanelProps>>(props)
