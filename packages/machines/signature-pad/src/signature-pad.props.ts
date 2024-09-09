import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { UserDefinedContext } from "./signature-pad.types"

export const props = createProps<UserDefinedContext>()([
  "dir",
  "disabled",
  "drawing",
  "getRootNode",
  "id",
  "ids",
  "name",
  "onDraw",
  "onDrawEnd",
  "readOnly",
  "required",
  "translations",
])

export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)
