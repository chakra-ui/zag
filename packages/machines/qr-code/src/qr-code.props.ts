import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { QRCodeProps } from "./qr-code.types"

export const props = createProps<QRCodeProps>()([
  "ids",
  "defaultValue",
  "value",
  "id",
  "encoding",
  "dir",
  "getRootNode",
  "onValueChange",
  "pixelSize",
])

export const splitProps = createSplitProps<Partial<QRCodeProps>>(props)
