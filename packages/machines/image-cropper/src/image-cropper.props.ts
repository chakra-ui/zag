import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ImageCropperProps } from "./image-cropper.types"

export const props = createProps<ImageCropperProps>()([
  "id",
  "ids",
  "dir",
  "getRootNode",
  "initialCrop",
  "minWidth",
  "minHeight",
  "maxWidth",
  "maxHeight",
  "aspectRatio",
  "zoom",
  "rotation",
  "defaultZoom",
  "defaultRotation",
  "zoomStep",
  "zoomSensitivity",
  "minZoom",
  "maxZoom",
  "onZoomChange",
  "onRotationChange",
  "fixedCropArea",
  "nudgeStep",
  "nudgeStepShift",
  "nudgeStepCtrl",
])

export const splitProps = createSplitProps<Partial<ImageCropperProps>>(props)
