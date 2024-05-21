import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { UserDefinedContext } from "./timer.types"

export const props = createProps<UserDefinedContext>()([
  "getRootNode",
  "id",
  "ids",
  "mode",
  "duration",
  "min",
  "autostart",
  "onTick",
  "onComplete",
])
export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)
