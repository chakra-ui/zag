import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils/object"
import type { ThumbProps, SliderProps, MarkerProps } from "./slider.types"

export const props = createProps<SliderProps>()([
  "dir",
  "disabled",
  "form",
  "getAriaLabel",
  "getAriaLabelledBy",
  "getAriaValueText",
  "getRootNode",
  "id",
  "ids",
  "invalid",
  "largeStep",
  "scale",
  "max",
  "min",
  "minStepsBetweenThumbs",
  "name",
  "onFocusChange",
  "onValueChange",
  "onValueChangeEnd",
  "orientation",
  "origin",
  "readOnly",
  "step",
  "thumbAlignment",
  "thumbCollisionBehavior",
  "thumbSize",
  "value",
  "defaultValue",
])

export const splitProps = createSplitProps<Partial<SliderProps>>(props)

export const thumbProps = createProps<ThumbProps>()(["disabled", "index", "name"])
export const splitThumbProps = createSplitProps<ThumbProps>(thumbProps)
export const markerProps = createProps<MarkerProps>()(["value"])
export const splitMarkerProps = createSplitProps<MarkerProps>(markerProps)
