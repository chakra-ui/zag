import { getChannelGradient } from "@zag-js/utils/color"
import type { ChannelProps, Color, ColorPickerProps } from "../color-picker.types"

interface SliderBackgroundProps extends Required<ChannelProps> {
  value: Color
  dir: ColorPickerProps["dir"]
}

/** The track gradient, running from the slider's minimum end to its maximum end */
export const getSliderBackground = ({ channel, value, dir, orientation }: SliderBackgroundProps) =>
  getChannelGradient(value, channel, orientation === "vertical" ? "top" : dir === "ltr" ? "right" : "left")
