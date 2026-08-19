import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { NumberFlowProps } from "./number-flow.types"

export const props = createProps<NumberFlowProps>()([
  "continuous",
  "defaultValue",
  "dir",
  "formatOptions",
  "getRootNode",
  "id",
  "ids",
  "live",
  "locale",
  "onAnimationComplete",
  "onAnimationStart",
  "onValueChange",
  "prefix",
  "respectMotionPreference",
  "spinTiming",
  "stagger",
  "suffix",
  "transformTiming",
  "trend",
  "value",
])

export const splitProps = createSplitProps<Partial<NumberFlowProps>>(props)
