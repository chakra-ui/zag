import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { UserDefinedContext } from "./marquee.types"

export const props = createProps<UserDefinedContext>()([
  "autoFill",
  "defaultPaused",
  "delay",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "loopCount",
  "onComplete",
  "onLoopComplete",
  "onPauseChange",
  "paused",
  "pauseOnInteraction",
  "reverse",
  "side",
  "spacing",
  "speed",
  "translations",
])
export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)
