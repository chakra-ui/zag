import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ItemProps, StepsProps } from "./steps.types"

export const props = createProps<StepsProps>()([
  "completedValues",
  "defaultCompletedValues",
  "defaultValue",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "items",
  "linear",
  "onComplete",
  "onCompletedChange",
  "onNavigationBlocked",
  "onValueChange",
  "orientation",
  "translations",
  "value",
])

export const splitProps = createSplitProps<Partial<StepsProps>>(props)

export const itemProps = createProps<ItemProps>()(["value"])

export const splitItemProps = createSplitProps<ItemProps>(itemProps)
