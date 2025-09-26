import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ImageCropperProps } from "./image-cropper.types"

export const props = createProps<ImageCropperProps>()(["id", "ids", "dir", "getRootNode"])

export const splitProps = createSplitProps<Partial<Partial<ImageCropperProps>>>(props)
