import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { UserDefinedContext } from "./timer.types"

export const props = createProps<UserDefinedContext>()([
  "autoStart",
  "countdown",
  "getRootNode",
  "id",
  "interval",
  "onComplete",
  "onTick",
  "startMs",
  "targetMs",
])

export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)
