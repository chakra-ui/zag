import { NormalizeProps, type PropTypes } from "@zag-js/types"
import { parts } from "./color-picker.anatomy"
import { ChannelProps, Send, State } from "./color-picker.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  return {
    previewProps: normalize.element({
      ...parts.preview.attrs,
    }),
    areaProps: normalize.element({
      ...parts.area.attrs,
    }),
    areaThumbProps: normalize.element({
      ...parts.areaThumb.attrs,
    }),
    getSliderThumbProps(props: ChannelProps) {
      return normalize.element({
        ...parts.sliderThumb.attrs,
      })
    },
    getSliderTrackProps(props: ChannelProps) {
      return normalize.element({
        ...parts.sliderTrack.attrs,
      })
    },
    getInputProps(props: ChannelProps) {
      return normalize.element({
        ...parts.input.attrs,
      })
    },
    eyeDropTriggerProps(props: ChannelProps) {
      return normalize.button({
        ...parts.eyeDropTrigger.attrs,
      })
    },
  }
}
