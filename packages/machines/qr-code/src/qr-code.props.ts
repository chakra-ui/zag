import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { QrCodeProps } from "./qr-code.types"

export const props = createProps<QrCodeProps>()([
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

export const splitProps = createSplitProps<Partial<QrCodeProps>>(props)
