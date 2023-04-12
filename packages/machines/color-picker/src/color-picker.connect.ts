import { EventKeyMap, getEventKey } from "@zag-js/dom-event"
import { NormalizeProps, type PropTypes } from "@zag-js/types"
import { parts } from "./color-picker.anatomy"
import { AreaProps, ChannelProps, PreviewProps, Send, State } from "./color-picker.types"
import { normalizeColor } from "@zag-js/color-utils"
import { getColorAreaGradient } from "./utils/get-color-area-gradient"
import { getChannelDetails } from "./color-picker.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const valueAsColor = state.context.valueAsColor
  const channels = valueAsColor.getColorChannels()
  return {
    channels,

    getPreviewProps(props: PreviewProps) {
      const { format = "css", value } = props
      const color = normalizeColor(value)
      return normalize.element({
        ...parts.preview.attrs,
        style: {
          background: color.toString(format),
        },
      })
    },

    getAreaProps(props: AreaProps) {
      const { xChannel, yChannel } = props
      const { areaStyles } = getColorAreaGradient(state.context, xChannel, yChannel)

      return normalize.element({
        ...parts.area.attrs,
        style: {
          position: "relative",
          touchAction: "none",
          forcedColorAdjust: "none",
          ...areaStyles,
        },
      })
    },

    getAreaGradientProps(props: AreaProps) {
      const { xChannel, yChannel } = props
      const { areaGradientStyles } = getColorAreaGradient(state.context, xChannel, yChannel)

      return normalize.element({
        ...parts.areaGradient.attrs,
        style: {
          position: "relative",
          touchAction: "none",
          forcedColorAdjust: "none",
          ...areaGradientStyles,
        },
      })
    },

    getAreaThumbProps(props: AreaProps) {
      const { xChannel, yChannel } = props
      const { getThumbPosition } = getChannelDetails(valueAsColor, xChannel, yChannel)
      const { x, y } = getThumbPosition()

      return normalize.element({
        ...parts.areaThumb.attrs,
        style: {
          position: "absolute",
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          transform: "translate(0%, 0%)",
          touchAction: "none",
          forcedColorAdjust: "none",
          background: state.context.displayColor.toString("css"),
        },
        onKeyDown(event) {
          const keyMap: EventKeyMap = {
            ArrowUp() {
              send("AREA.ARROW_UP")
            },
            ArrowDown() {
              send("AREA.ARROW_DOWN")
            },
            ArrowLeft() {
              send("AREA.ARROW_LEFT")
            },
            ArrowRight() {
              send("AREA.ARROW_RIGHT")
            },
            PageUp() {
              send("AREA.PAGE_UP")
            },
            PageDown() {
              send("AREA.PAGE_DOWN")
            },
          }

          const execute = keyMap[getEventKey(event, state.context)]
          if (execute) {
            execute(event)
            event.preventDefault()
          }
        },
      })
    },

    getSliderThumbProps(props: ChannelProps) {
      const { orientation = "horizontal" } = props
      return normalize.element({
        ...parts.sliderThumb.attrs,
        role: "slider",
        "aria-orientation": orientation,
        "data-orientation": orientation,
        style: {},
      })
    },

    getSliderTrackProps(props: ChannelProps) {
      return normalize.element({
        ...parts.sliderTrack.attrs,
        style: {
          touchAction: "none",
          forcedColorAdjust: "none",
          backgroundImage: "TODO",
        },
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
        onClick() {
          send("EYEDROP.CLICK")
        },
      })
    },
  }
}
