import { createProps } from "@zag-js/types"
import type { ContentProps, TriggerProps, UserDefinedContext } from "./tabs.types"

export const props = createProps<UserDefinedContext>()([
  "activationMode",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "loop",
  "onFocusChange",
  "onValueChange",
  "orientation",
  "translations",
  "value",
])

export const triggerProps = createProps<TriggerProps>()(["disabled", "value"])

export const contentProps = createProps<ContentProps>()(["value"])
