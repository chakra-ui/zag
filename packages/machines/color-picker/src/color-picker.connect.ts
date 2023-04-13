import { Color, ColorFormat, normalizeColor } from "@zag-js/color-utils"
import { EventKeyMap, getEventKey, getNativeEvent, isLeftClick, isModifiedEvent } from "@zag-js/dom-event"
import { dataAttr } from "@zag-js/dom-query"
import { NormalizeProps, type PropTypes } from "@zag-js/types"
import { parts } from "./color-picker.anatomy"
import { dom } from "./color-picker.dom"
import { AreaProps, ChannelProps, Send, State, SwatchProps } from "./color-picker.types"
import { getChannelDetails } from "./color-picker.utils"
import { getChannelDisplayColor } from "./utils/get-channel-display-color"
import { getColorAreaGradient } from "./utils/get-color-area-gradient"
import { getSliderBgImage } from "./utils/get-slider-background"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const valueAsColor = state.context.valueAsColor
  const isDisabled = state.context.disabled
  const channels = valueAsColor.getColorChannels()

  return {
    value: state.context.value,
    valueAsColor,
    channels,
    setColor(value: string | Color) {
      send({ type: "VALUE.SET", value: normalizeColor(value) })
    },
    setFormat(format: ColorFormat) {
      const value = valueAsColor.toFormat(format)
      send({ type: "VALUE.SET", value })
    },

    contentProps: normalize.element({
      ...parts.content.attrs,
      id: dom.getContentId(state.context),
    }),

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
          background: valueAsColor.withChannelValue("alpha", 1).toString("css"),
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

    getChannelInputProps(props: ChannelProps) {
      const { channel } = props
      return normalize.input({
        ...parts.input.attrs,
        type: "number",
        "data-channel": channel,
        "aria-label": channel,
        disabled: isDisabled,
        id: dom.getInputId(state.context, channel),
        defaultValue: valueAsColor.getChannelValue(channel),
        onChange(event) {
          const value = event.currentTarget.value
          send({ type: "INPUT.CHANGE", channel, value })
        },
        style: {
          appearance: "none",
          WebkitAppearance: "none",
        },
      })
    },

    eyeDropperTriggerProps: normalize.button({
      ...parts.eyeDropTrigger.attrs,
      onClick() {
        send("EYEDROPPER.CLICK")
      },
    }),

    getSwatchBackgroundProps(props: SwatchProps) {
      const { value } = props
      const alpha = normalizeColor(value).getChannelValue("alpha")
      return normalize.element({
        ...parts.swatchBg.attrs,
        "data-alpha": alpha,
        style: {
          width: "100%",
          height: "100%",
          background: "#fff",
          backgroundImage: `linear-gradient(-45deg,#0000 75.5%,#bcbcbc 75.5%),linear-gradient(45deg,#0000 75.5%,#bcbcbc 75.5%),linear-gradient(-45deg,#bcbcbc 25.5%,#0000 25.5%),linear-gradient(45deg,#bcbcbc 25.5%,#0000 25.5%)`,
          backgroundPosition: "-2px -2px,-2px 6px,6px -10px,-10px -2px",
          backgroundSize: "16px 16px",
          position: "absolute",
          inset: "0px",
          zIndex: -1,
        },
      })
    },

    getSwatchProps(props: SwatchProps) {
      const { value } = props
      const color = normalizeColor(value)
      return normalize.element({
        ...parts.swatch.attrs,
        style: {
          position: "relative",
          background: color.toString("css"),
        },
      })
    },
  }
}
