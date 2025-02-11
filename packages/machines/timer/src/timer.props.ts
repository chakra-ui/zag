import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { TimerProps } from "./timer.types"

export const props = createProps<TimerProps>()([
  "autoStart",
  "countdown",
  "getRootNode",
  "id",
  "ids",
  "interval",
  "onComplete",
  "onTick",
  "startMs",
  "targetMs",
])

export const splitProps = createSplitProps<Partial<TimerProps>>(props)
