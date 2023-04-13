import { normalizeColor } from "@zag-js/color-utils"
import { EventKeyMap, getEventKey, getNativeEvent, isLeftClick, isModifiedEvent } from "@zag-js/dom-event"
import { dataAttr } from "@zag-js/dom-query"
import { NormalizeProps, type PropTypes } from "@zag-js/types"
import { parts } from "./color-picker.anatomy"
import { AreaProps, ChannelProps, PreviewProps, Send, State } from "./color-picker.types"
import { getChannelDetails } from "./color-picker.utils"
import { getColorAreaGradient } from "./utils/get-color-area-gradient"
import { getSliderBgImage } from "./utils/get-slider-background"
import { dom } from "./color-picker.dom"
import { getChannelDisplayColor } from "./utils/get-channel-display-color"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const valueAsColor = state.context.valueAsColor
  const isDisabled = state.context.disabled
  const channels = valueAsColor.getColorChannels()

  return {
    channels,

    getAreaProps(props: AreaProps) {
      const { xChannel, yChannel } = props
      const { areaStyles } = getColorAreaGradient(state.context, xChannel, yChannel)

      return normalize.element({
        ...parts.area.attrs,
        id: dom.getAreaId(state.context),
        role: "group",
        onPointerDown(event) {
          const evt = getNativeEvent(event)
          if (!isLeftClick(evt) || isModifiedEvent(evt)) return
          const point = { x: evt.clientX, y: evt.clientY }
          const channel = { xChannel, yChannel }
          send({ type: "AREA.POINTER_DOWN", point, channel, id: "area" })
        },
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
        id: dom.getAreaGradientId(state.context),
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
        id: dom.getAreaThumbId(state.context),
        tabIndex: isDisabled ? undefined : 0,
        "data-disabled": dataAttr(isDisabled),
        role: "presentation",
        style: {
          position: "absolute",
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          transform: "translate(-50%, -50%)",
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

    getSliderTrackProps(props: ChannelProps) {
      const { orientation = "horizontal", channel } = props

      return normalize.element({
        ...parts.sliderTrack.attrs,
        id: dom.getSliderTrackId(state.context, channel),
        role: "group",
        "data-channel": channel,
        onPointerDown(event) {
          const evt = getNativeEvent(event)
          if (!isLeftClick(evt) || isModifiedEvent(evt)) return
          const point = { x: evt.clientX, y: evt.clientY }
          send({ type: "SLIDER.POINTER_DOWN", channel, point, id: channel })
        },
        style: {
          position: "relative",
          touchAction: "none",
          forcedColorAdjust: "none",
          backgroundImage: getSliderBgImage(state.context, { orientation, channel }),
        },
      })
    },

    getSliderBackgroundProps(props: ChannelProps) {
      const { orientation = "horizontal", channel } = props
      return normalize.element({
        ...parts.sliderTrackBg.attrs,
        "data-orientation": orientation,
        "data-channel": channel,
        style: {
          position: "absolute",
          backgroundColor: "#fff",
          backgroundImage: `linear-gradient(-45deg,#0000 75.5%,#bcbcbc 75.5%),linear-gradient(45deg,#0000 75.5%,#bcbcbc 75.5%),linear-gradient(-45deg,#bcbcbc 25.5%,#0000 25.5%),linear-gradient(45deg,#bcbcbc 25.5%,#0000 25.5%)`,
          backgroundSize: "16px 16px",
          backgroundPosition: "-2px -2px,-2px 6px,6px -10px,-10px -2px",
          inset: 0,
          zIndex: -1,
        },
      })
    },

    getSliderThumbProps(props: ChannelProps) {
      const { orientation = "horizontal", channel } = props
      const { minValue, maxValue } = valueAsColor.getChannelRange(channel)
      const channelValue = valueAsColor.getChannelValue(channel)

      const offset = (channelValue - minValue) / (maxValue - minValue)

      const placementStyles =
        orientation === "horizontal"
          ? { left: `${offset * 100}%`, top: "50%" }
          : { top: `${offset * 100}%`, left: "50%" }

      return normalize.element({
        ...parts.sliderThumb.attrs,
        role: "slider",
        tabIndex: isDisabled ? undefined : 0,
        "aria-orientation": orientation,
        "data-orientation": orientation,
        "aria-valuemax": maxValue,
        "aria-valuemin": minValue,
        "aria-valuenow": channelValue,
        style: {
          forcedColorAdjust: "none",
          position: "absolute",
          background: getChannelDisplayColor(valueAsColor, channel).toString("css"),
          ...placementStyles,
        },
        onFocus() {
          send({ type: "SLIDER.FOCUS", channel })
        },
        onBlur() {
          send({ type: "SLIDER.BLUR", channel })
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
  }
}
