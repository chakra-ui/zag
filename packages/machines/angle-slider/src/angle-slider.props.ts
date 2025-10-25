import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { AngleSliderProps } from "./angle-slider.types"

export const props = createProps<AngleSliderProps>()([
  "aria-label",
  "aria-labelledby",
  "dir",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "invalid",
  "name",
  "onValueChange",
  "onValueChangeEnd",
  "readOnly",
  "step",
  "value",
  "defaultValue",
])

export const splitProps = createSplitProps<Partial<AngleSliderProps>>(props)
