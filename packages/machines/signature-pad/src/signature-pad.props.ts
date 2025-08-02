import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { SignaturePadProps } from "./signature-pad.types"

export const props = createProps<SignaturePadProps>()([
  "defaultPaths",
  "dir",
  "disabled",
  "drawing",
  "getRootNode",
  "id",
  "ids",
  "name",
  "onDraw",
  "onDrawEnd",
  "paths",
  "readOnly",
  "required",
  "translations",
])

export const splitProps = createSplitProps<Partial<SignaturePadProps>>(props)
