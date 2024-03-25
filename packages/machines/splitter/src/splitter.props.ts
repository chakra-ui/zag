import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { PanelProps, ResizeTriggerProps, UserDefinedContext } from "./splitter.types"

export const props = createProps<UserDefinedContext>()([
  "dir",
  "getRootNode",
  "id",
  "ids",
  "onSizeChange",
  "onSizeChangeEnd",
  "orientation",
  "size",
])

export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)

export const panelProps = createProps<PanelProps>()(["id", "snapSize"])
export const splitPanelProps = createSplitProps<PanelProps>(panelProps)

export const resizeTriggerProps = createProps<ResizeTriggerProps>()(["disabled", "id", "step"])
export const splitResizeTriggerProps = createSplitProps<ResizeTriggerProps>(resizeTriggerProps)
