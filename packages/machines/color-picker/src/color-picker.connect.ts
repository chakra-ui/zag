import { getColorAreaGradient, normalizeColor } from "@zag-js/color-utils"
import {
  getEventKey,
  getEventPoint,
  getEventStep,
  getNativeEvent,
  isLeftClick,
  isModifiedEvent,
  type EventKeyMap,
} from "@zag-js/dom-event"
import { dataAttr, query } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { visuallyHiddenStyle } from "@zag-js/visually-hidden"
import { parts } from "./color-picker.anatomy"
import { dom } from "./color-picker.dom"
import type {
  AreaProps,
  ColorFormat,
  MachineApi,
  Send,
  State,
  SwatchTriggerProps,
  SwatchTriggerState,
} from "./color-picker.types"
import { getChannelDisplayColor } from "./utils/get-channel-display-color"
import { getChannelRange, getChannelValue } from "./utils/get-channel-input-value"
import { getSliderBackground } from "./utils/get-slider-background"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const value = state.context.value
  const areaValue = state.context.areaValue
  const valueAsString = state.context.valueAsString

  const isDisabled = state.context.isDisabled
  const isInteractive = state.context.isInteractive

  const isDragging = state.hasTag("dragging")
  const isOpen = state.hasTag("open")
  const isFocused = state.hasTag("focused")

  const getAreaChannels = (props: AreaProps) => {
    const channels = areaValue.getChannels()
    return {
      xChannel: props.xChannel ?? channels[1],
      yChannel: props.yChannel ?? channels[2],
    }
  }

  const currentPlacement = state.context.currentPlacement
  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
    placement: currentPlacement,
  })

  function getSwatchTriggerState(props: SwatchTriggerProps): SwatchTriggerState {
    const color = normalizeColor(props.value).toFormat(state.context.format)
    return {
      value: color,
      valueAsString: color.toString("hex"),
      isChecked: color.isEqual(value),
      isDisabled: props.disabled || !isInteractive,
    }
  }

  return {
    isDragging,
    isOpen,
    valueAsString,
    value,
    open() {
      send({ type: "OPEN" })
    },
    close() {
      send({ type: "CLOSE" })
    },
    setValue(value) {
      send({ type: "VALUE.SET", value: normalizeColor(value), src: "set-color" })
    },
    getChannelValue(channel) {
      return getChannelValue(value, channel)
    },
    setChannelValue(channel, channelValue) {
      const color = value.withChannelValue(channel, channelValue)
      send({ type: "VALUE.SET", value: color, src: "set-channel" })
    },
    format: state.context.format,
    setFormat(format) {
      const formatValue = value.toFormat(format)
      send({ type: "VALUE.SET", value: formatValue, src: "set-format" })
    },
    alpha: value.getChannelValue("alpha"),
    setAlpha(alphaValue) {
      const color = value.withChannelValue("alpha", alphaValue)
      send({ type: "VALUE.SET", value: color, src: "set-alpha" })
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      dir: state.context.dir,
      id: dom.getRootId(state.context),
      "data-disabled": dataAttr(isDisabled),
      "data-readonly": dataAttr(state.context.readOnly),
      style: {
        "--value": value.toString("css"),
      },
    }),

    labelProps: normalize.element({
      ...parts.label.attrs,
      dir: state.context.dir,
      id: dom.getLabelId(state.context),
      htmlFor: dom.getHiddenInputId(state.context),
      "data-disabled": dataAttr(isDisabled),
      "data-readonly": dataAttr(state.context.readOnly),
      "data-focus": dataAttr(isFocused),
      onClick(event) {
        event.preventDefault()
        const inputEl = query(dom.getControlEl(state.context), "[data-channel=hex]")
        inputEl?.focus({ preventScroll: true })
      },
    }),

    controlProps: normalize.element({
      ...parts.control.attrs,
      id: dom.getControlId(state.context),
      dir: state.context.dir,
      "data-disabled": dataAttr(isDisabled),
      "data-readonly": dataAttr(state.context.readOnly),
      "data-state": isOpen ? "open" : "closed",
      "data-focus": dataAttr(isFocused),
    }),

    triggerProps: normalize.button({
      ...parts.trigger.attrs,
      id: dom.getTriggerId(state.context),
      dir: state.context.dir,
      disabled: isDisabled,
      "aria-label": `select color. current color is ${valueAsString}`,
      "aria-controls": dom.getContentId(state.context),
      "aria-labelledby": dom.getLabelId(state.context),
      "data-disabled": dataAttr(isDisabled),
      "data-readonly": dataAttr(state.context.readOnly),
      "data-placement": currentPlacement,
      "aria-expanded": dataAttr(isOpen),
      "data-state": isOpen ? "open" : "closed",
      "data-focus": dataAttr(isFocused),
      type: "button",
      onClick() {
        if (!isInteractive) return
        send({ type: "TRIGGER.CLICK" })
      },
      onBlur() {
        if (!isInteractive) return
        send({ type: "TRIGGER.BLUR" })
      },
      style: {
        position: "relative",
      },
    }),

    positionerProps: normalize.element({
      ...parts.positioner.attrs,
      id: dom.getPositionerId(state.context),
      dir: state.context.dir,
      style: popperStyles.floating,
    }),

    contentProps: normalize.element({
      ...parts.content.attrs,
      id: dom.getContentId(state.context),
      dir: state.context.dir,
      "data-placement": currentPlacement,
      "data-state": isOpen ? "open" : "closed",
      hidden: !isOpen,
    }),

    getAreaProps(props = {}) {
      const { xChannel, yChannel } = getAreaChannels(props)
      const { areaStyles } = getColorAreaGradient(areaValue, {
        xChannel,
        yChannel,
        dir: state.context.dir,
      })

      return normalize.element({
        ...parts.area.attrs,
        id: dom.getAreaId(state.context),
        role: "group",
        onPointerDown(event) {
          if (!isInteractive) return

          const evt = getNativeEvent(event)
          if (!isLeftClick(evt) || isModifiedEvent(evt)) return

          const point = getEventPoint(evt)
          const channel = { xChannel, yChannel }

          send({ type: "AREA.POINTER_DOWN", point, channel, id: "area" })
          event.preventDefault()
        },
        style: {
          position: "relative",
          touchAction: "none",
          forcedColorAdjust: "none",
          ...areaStyles,
        },
      })
    },

    getAreaBackgroundProps(props = {}) {
      const { xChannel, yChannel } = getAreaChannels(props)
      const { areaGradientStyles } = getColorAreaGradient(areaValue, {
        xChannel,
        yChannel,
        dir: state.context.dir,
      })

      return normalize.element({
        ...parts.areaBackground.attrs,
        id: dom.getAreaGradientId(state.context),
        style: {
          position: "relative",
          touchAction: "none",
          forcedColorAdjust: "none",
          ...areaGradientStyles,
        },
      })
    },

    getAreaThumbProps(props = {}) {
      const { xChannel, yChannel } = getAreaChannels(props)
      const channel = { xChannel, yChannel }

      const xPercent = areaValue.getChannelValuePercent(xChannel)
      const yPercent = 1 - areaValue.getChannelValuePercent(yChannel)

      const xValue = areaValue.getChannelValue(xChannel)
      const yValue = areaValue.getChannelValue(yChannel)

      return normalize.element({
        ...parts.areaThumb.attrs,
        id: dom.getAreaThumbId(state.context),
        dir: state.context.dir,
        tabIndex: isDisabled ? undefined : 0,
        "data-disabled": dataAttr(isDisabled),
        role: "slider",
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuenow": xValue,
        "aria-label": `${xChannel} and ${yChannel}`,
        "aria-roledescription": "2d slider",
        "aria-valuetext": `${xChannel} ${xValue}, ${yChannel} ${yValue}`,
        style: {
          position: "absolute",
          left: `${xPercent * 100}%`,
          top: `${yPercent * 100}%`,
          transform: "translate(-50%, -50%)",
          touchAction: "none",
          forcedColorAdjust: "none",
          background: areaValue.withChannelValue("alpha", 1).toString("css"),
        },
        onFocus() {
          if (!isInteractive) return
          send({ type: "AREA.FOCUS", id: "area", channel })
        },
        onKeyDown(event) {
          if (!isInteractive) return

          const step = getEventStep(event)

          const keyMap: EventKeyMap = {
            ArrowUp() {
              send({ type: "AREA.ARROW_UP", channel, step })
            },
            ArrowDown() {
              send({ type: "AREA.ARROW_DOWN", channel, step })
            },
            ArrowLeft() {
              send({ type: "AREA.ARROW_LEFT", channel, step })
            },
            ArrowRight() {
              send({ type: "AREA.ARROW_RIGHT", channel, step })
            },
            PageUp() {
              send({ type: "AREA.PAGE_UP", channel, step })
            },
            PageDown() {
              send({ type: "AREA.PAGE_DOWN", channel, step })
            },
            Escape(event) {
              event.stopPropagation()
            },
          }

          const exec = keyMap[getEventKey(event, state.context)]

          if (exec) {
            exec(event)
            event.preventDefault()
          }
        },
      })
    },

    getTransparencyGridProps(props = {}) {
      const { size = "12px" } = props
      return normalize.element({
        ...parts.transparencyGrid.attrs,
        style: {
          "--size": size,
          width: "100%",
          height: "100%",
          position: "absolute",
          backgroundColor: "#fff",
          backgroundImage: "conic-gradient(#eeeeee 0 25%, transparent 0 50%, #eeeeee 0 75%, transparent 0)",
          backgroundSize: "var(--size) var(--size)",
          inset: "0px",
          zIndex: "auto",
          pointerEvents: "none",
        },
      })
    },

    getChannelSliderProps(props) {
      const { orientation = "horizontal", channel } = props
      return normalize.element({
        ...parts.channelSlider.attrs,
        "data-channel": channel,
        "data-orientation": orientation,
        role: "presentation",
        onPointerDown(event) {
          if (!isInteractive) return

          const evt = getNativeEvent(event)
          if (!isLeftClick(evt) || isModifiedEvent(evt)) return

          const point = getEventPoint(evt)
          send({ type: "CHANNEL_SLIDER.POINTER_DOWN", channel, point, id: channel, orientation })

          event.preventDefault()
        },
        style: {
          position: "relative",
          touchAction: "none",
        },
      })
    },

    getChannelSliderTrackProps(props) {
      const { orientation = "horizontal", channel } = props

      return normalize.element({
        ...parts.channelSliderTrack.attrs,
        id: dom.getChannelSliderId(state.context, channel),
        role: "group",
        "data-channel": channel,
        "data-orientation": orientation,
        style: {
          position: "relative",
          forcedColorAdjust: "none",
          backgroundImage: getSliderBackground({
            orientation,
            channel,
            dir: state.context.dir,
            value: areaValue,
          }),
        },
      })
    },

    getChannelSliderThumbProps(props) {
      const { orientation = "horizontal", channel } = props
      const { minValue, maxValue, step: stepValue } = areaValue.getChannelRange(channel)
      const channelValue = areaValue.getChannelValue(channel)

      const offset = (channelValue - minValue) / (maxValue - minValue)

      const placementStyles =
        orientation === "horizontal"
          ? { left: `${offset * 100}%`, top: "50%" }
          : { top: `${offset * 100}%`, left: "50%" }

      return normalize.element({
        ...parts.channelSliderThumb.attrs,
        id: dom.getChannelSliderThumbId(state.context, channel),
        role: "slider",
        "aria-label": channel,
        tabIndex: isDisabled ? undefined : 0,
        "data-channel": channel,
        "data-disabled": dataAttr(isDisabled),
        "data-orientation": orientation,
        "aria-disabled": dataAttr(isDisabled),
        "aria-orientation": orientation,
        "aria-valuemax": maxValue,
        "aria-valuemin": minValue,
        "aria-valuenow": channelValue,
        "aria-valuetext": `${channel} ${channelValue}`,
        style: {
          forcedColorAdjust: "none",
          position: "absolute",
          background: getChannelDisplayColor(areaValue, channel).toString("css"),
          ...placementStyles,
        },
        onFocus() {
          if (!isInteractive) return
          send({ type: "CHANNEL_SLIDER.FOCUS", channel })
        },
        onKeyDown(event) {
          if (!isInteractive) return
          const step = getEventStep(event) * stepValue

          const keyMap: EventKeyMap = {
            ArrowUp() {
              send({ type: "CHANNEL_SLIDER.ARROW_UP", channel, step })
            },
            ArrowDown() {
              send({ type: "CHANNEL_SLIDER.ARROW_DOWN", channel, step })
            },
            ArrowLeft() {
              send({ type: "CHANNEL_SLIDER.ARROW_LEFT", channel, step })
            },
            ArrowRight() {
              send({ type: "CHANNEL_SLIDER.ARROW_RIGHT", channel, step })
            },
            PageUp() {
              send({ type: "CHANNEL_SLIDER.PAGE_UP", channel })
            },
            PageDown() {
              send({ type: "CHANNEL_SLIDER.PAGE_DOWN", channel })
            },
            Home() {
              send({ type: "CHANNEL_SLIDER.HOME", channel })
            },
            End() {
              send({ type: "CHANNEL_SLIDER.END", channel })
            },
            Escape(event) {
              event.stopPropagation()
            },
          }

          const exec = keyMap[getEventKey(event, state.context)]

          if (exec) {
            exec(event)
            event.preventDefault()
          }
        },
      })
    },

    getChannelInputProps(props) {
      const { channel } = props
      const isTextField = channel === "hex" || channel === "css"
      const range = getChannelRange(value, channel)

      return normalize.input({
        ...parts.channelInput.attrs,
        dir: state.context.dir,
        type: isTextField ? "text" : "number",
        "data-channel": channel,
        "aria-label": channel,
        spellCheck: false,
        autoComplete: "off",
        disabled: isDisabled,
        "data-disabled": dataAttr(isDisabled),
        readOnly: state.context.readOnly,
        defaultValue: getChannelValue(value, channel),
        min: range?.minValue,
        max: range?.maxValue,
        step: range?.step,
        onBeforeInput(event) {
          if (isTextField || !isInteractive) return
          const value = event.currentTarget.value
          if (value.match(/[^0-9.]/g)) {
            event.preventDefault()
          }
        },
        onFocus(event) {
          if (!isInteractive) return
          send({ type: "CHANNEL_INPUT.FOCUS", channel })
          event.target.select()
        },
        onBlur(event) {
          if (!isInteractive) return
          const value = isTextField ? event.currentTarget.value : event.currentTarget.valueAsNumber
          send({ type: "CHANNEL_INPUT.BLUR", channel, value, isTextField })
        },
        onKeyDown(event) {
          if (!isInteractive) return
          if (event.key === "Enter") {
            const value = isTextField ? event.currentTarget.value : event.currentTarget.valueAsNumber
            send({ type: "CHANNEL_INPUT.CHANGE", channel, value, isTextField })
            event.preventDefault()
          }
        },
        style: {
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "textfield",
        },
      })
    },

    hiddenInputProps: normalize.input({
      type: "text",
      disabled: isDisabled,
      name: state.context.name,
      id: dom.getHiddenInputId(state.context),
      style: visuallyHiddenStyle,
      defaultValue: valueAsString,
    }),

    eyeDropperTriggerProps: normalize.button({
      ...parts.eyeDropperTrigger.attrs,
      type: "button",
      dir: state.context.dir,
      disabled: isDisabled,
      "data-disabled": dataAttr(isDisabled),
      "aria-label": "Pick a color from the screen",
      onClick() {
        if (!isInteractive) return
        send("EYEDROPPER.CLICK")
      },
    }),

    swatchGroupProps: normalize.element({
      ...parts.swatchGroup.attrs,
      role: "group",
    }),

    getSwatchTriggerState,

    getSwatchTriggerProps(props) {
      const triggerState = getSwatchTriggerState(props)
      return normalize.button({
        ...parts.swatchTrigger.attrs,
        disabled: triggerState.isDisabled,
        dir: state.context.dir,
        type: "button",
        "aria-label": `select ${triggerState.valueAsString} as the color`,
        "data-state": triggerState.isChecked ? "checked" : "unchecked",
        "data-value": triggerState.valueAsString,
        "data-disabled": dataAttr(triggerState.isDisabled),
        onClick() {
          if (triggerState.isDisabled) return
          send({ type: "SWATCH_TRIGGER.CLICK", value: triggerState.value })
        },
        style: {
          position: "relative",
        },
      })
    },

    getSwatchIndicatorProps(props) {
      const triggerState = getSwatchTriggerState(props)
      return normalize.element({
        ...parts.swatchIndicator.attrs,
        dir: state.context.dir,
        hidden: !triggerState.isChecked,
      })
    },

    getSwatchProps(props) {
      const { respectAlpha = true } = props
      const triggerState = getSwatchTriggerState(props)
      return normalize.element({
        ...parts.swatch.attrs,
        dir: state.context.dir,
        "data-state": triggerState.isChecked ? "checked" : "unchecked",
        "data-value": triggerState.valueAsString,
        style: {
          position: "relative",
          background: triggerState.value.toString(respectAlpha ? "css" : "hex"),
        },
      })
    },

    formatTriggerProps: normalize.button({
      ...parts.formatTrigger.attrs,
      dir: state.context.dir,
      type: "button",
      "aria-label": `change color format to ${getNextFormat(state.context.format)}`,
      onClick(event) {
        if (event.currentTarget.disabled) return
        const nextFormat = getNextFormat(state.context.format)
        send({ type: "FORMAT.SET", format: nextFormat, src: "format-trigger" })
      },
    }),

    formatSelectProps: normalize.select({
      ...parts.formatSelect.attrs,
      "aria-label": "change color format",
      dir: state.context.dir,
      defaultValue: state.context.format,
      disabled: isDisabled,
      onChange(event) {
        const format = assertFormat(event.currentTarget.value)
        send({ type: "FORMAT.SET", format, src: "format-select" })
      },
    }),
  }
}

const formats: ColorFormat[] = ["hsba", "hsla", "rgba"]
const formatRegex = new RegExp(`^(${formats.join("|")})$`)

function getNextFormat(format: ColorFormat) {
  const index = formats.indexOf(format)
  return formats[index + 1] ?? formats[0]
}

function assertFormat(format: string) {
  if (formatRegex.test(format)) return format as ColorFormat
  throw new Error(`Unsupported color format: ${format}`)
}
