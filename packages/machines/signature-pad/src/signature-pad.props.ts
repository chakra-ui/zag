import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { UserDefinedContext } from "./signature-pad.types"

export const props = createProps<UserDefinedContext>()([
  "dir",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "onDraw",
  "onDrawEnd",
  "readOnly",
  "drawing",
  "name",
])

export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)
