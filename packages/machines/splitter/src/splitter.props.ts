import { createProps } from "@zag-js/types"
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

export const panelProps = createProps<PanelProps>()(["id", "snapSize"])

export const resizeTriggerProps = createProps<ResizeTriggerProps>()(["disabled", "id", "step"])
