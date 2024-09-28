import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { UserDefinedContext } from "./tour.types"

export const props = createProps<UserDefinedContext>()([
  "closeOnEscape",
  "closeOnInteractOutside",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "keyboardNavigation",
  "onFocusOutside",
  "onInteractOutside",
  "onPointerDownOutside",
  "onStatusChange",
  "onStepChange",
  "preventInteraction",
  "spotlightOffset",
  "spotlightRadius",
  "stepId",
  "steps",
  "translations",
])

export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)
