import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ImageCropperProps } from "./image-cropper.types"

export const props = createProps<ImageCropperProps>()([
  "id",
  "ids",
  "dir",
  "getRootNode",
  "initialCrop",
  "minCropSize",
  "aspectRatio",
  "zoom",
  "rotation",
  "defaultZoom",
  "defaultRotation",
  "zoomStep",
  "minZoom",
  "maxZoom",
  "onZoomChange",
  "onRotationChange",
])

export const splitProps = createSplitProps<Partial<ImageCropperProps>>(props)
