import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { PanelProps, ResizeTriggerProps, SplitterProps } from "./splitter.types"

export const props = createProps<SplitterProps>()([
  "dir",
  "getRootNode",
  "id",
  "ids",
  "onResize",
  "onResizeStart",
  "onResizeEnd",
  "onCollapse",
  "onExpand",
  "orientation",
  "size",
  "defaultSize",
  "panels",
  "keyboardResizeBy",
  "nonce",
  "registry",
])

export const splitProps = createSplitProps<Partial<SplitterProps>>(props)

export const panelProps = createProps<PanelProps>()(["id"])
export const splitPanelProps = createSplitProps<PanelProps>(panelProps)

export const resizeTriggerProps = createProps<ResizeTriggerProps>()(["disabled", "id"])
export const splitResizeTriggerProps = createSplitProps<ResizeTriggerProps>(resizeTriggerProps)
