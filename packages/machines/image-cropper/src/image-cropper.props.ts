import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { HandlePosition, ImageCropperProps } from "./image-cropper.types"

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
  "cropShape",
  "zoom",
  "rotation",
  "flip",
  "defaultZoom",
  "defaultRotation",
  "defaultFlip",
  "zoomStep",
  "zoomSensitivity",
  "minZoom",
  "maxZoom",
  "onZoomChange",
  "onRotationChange",
  "onFlipChange",
  "onCropChange",
  "fixedCropArea",
  "nudgeStep",
  "nudgeStepShift",
  "nudgeStepCtrl",
  "translations",
])

export const splitProps = createSplitProps<Partial<ImageCropperProps>>(props)

export const handles: HandlePosition[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"]
