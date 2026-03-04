import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { FloatingPanelProps, ResizeTriggerAxis, ResizeTriggerProps } from "./floating-panel.types"

export const props = createProps<FloatingPanelProps>()([
  "allowOverflow",
  "closeOnEscape",
  "defaultOpen",
  "defaultPosition",
  "defaultSize",
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
  "size",
  "strategy",
  "translations",
])
export const splitProps = createSplitProps<Partial<FloatingPanelProps>>(props)

export const resizeTriggerProps = createProps<ResizeTriggerProps>()(["axis"])
export const splitResizeTriggerProps = createSplitProps<Partial<ResizeTriggerProps>>(resizeTriggerProps)

export const resizeTriggerAxes: ResizeTriggerAxis[] = ["n", "e", "s", "w", "ne", "nw", "se", "sw"]
