import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { UserDefinedContext } from "./tour.types"

export const props = createProps<UserDefinedContext>()([
  "closeOnEsc",
  "closeOnInteractOutside",
  "dir",
  "getRootNode",
  "id",
  "keyboardNavigation",
  "offset",
  "onFocusOutside",
  "onInteractOutside",
  "onPointerDownOutside",
  "onStatusChange",
  "onStepChange",
  "preventInteraction",
  "radius",
  "skipBehavior",
  "step",
  "steps",
  "translations",
])

export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)
