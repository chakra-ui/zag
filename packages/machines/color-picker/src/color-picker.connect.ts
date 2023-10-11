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
import { dataAttr, raf } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { visuallyHiddenStyle } from "@zag-js/visually-hidden"
import { parts } from "./color-picker.anatomy"
import { dom } from "./color-picker.dom"
import type { AreaProps, MachineApi, Send, State } from "./color-picker.types"
import { getChannelDisplayColor } from "./utils/get-channel-display-color"
import { getChannelInputRange, getChannelInputValue } from "./utils/get-channel-input-value"
import { getSliderBackground } from "./utils/get-slider-background"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const value = state.context.value
  const valueAsString = state.context.valueAsString
  const isDisabled = state.context.isDisabled
  const isInteractive = state.context.isInteractive

  const isDragging = state.hasTag("dragging")
  const isOpen = state.hasTag("open")

  const channels = value.getChannels()

  const getResolvedChannels = (props: AreaProps) => ({
    xChannel: props.xChannel ?? channels[0],
    yChannel: props.yChannel ?? channels[1],
  })

  const currentPlacement = state.context.currentPlacement
  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
    placement: currentPlacement,
  })

  return {
    isDragging,
    isOpen,
    valueAsString,
    value: value,
    alpha: value.getChannelValue("alpha"),
    channels,

    setColor(value) {
      send({ type: "VALUE.SET", value: normalizeColor(value), src: "set-color" })
    },

    setChannelValue(channel, channelValue) {
      const color = value.withChannelValue(channel, channelValue)
      send({ type: "VALUE.SET", value: color, src: "set-channel" })
    },

    setFormat(format) {
      const formatValue = value.toFormat(format)
      send({ type: "VALUE.SET", value: formatValue, src: "set-format" })
    },

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
      onClick(event) {
        event.preventDefault()
        dom.getInputEl(state.context)?.focus({ preventScroll: true })
      },
    }),

    controlProps: normalize.element({
      ...parts.control.attrs,
      id: dom.getControlId(state.context),
      dir: state.context.dir,
      "data-disabled": dataAttr(isDisabled),
      "data-readonly": dataAttr(state.context.readOnly),
    }),

    triggerProps: normalize.button({
      ...parts.trigger.attrs,
      id: dom.getTriggerId(state.context),
      dir: state.context.dir,
      "aria-labelledby": dom.getLabelId(state.context),
      "data-disabled": dataAttr(isDisabled),
      "data-readonly": dataAttr(state.context.readOnly),
      "data-placement": currentPlacement,
      type: "button",
      onClick() {
        send({ type: "TRIGGER.CLICK" })
      },
      style: {
        position: "relative",
      },
    }),

    inputProps: normalize.input({
      ...parts.input.attrs,
      dir: state.context.dir,
      id: dom.getInputId(state.context),
      "data-disabled": dataAttr(isDisabled),
      "data-readonly": dataAttr(state.context.readOnly),
      disabled: isDisabled,
      "aria-labelledby": dom.getLabelId(state.context),
      readOnly: state.context.readOnly,
      defaultValue: value.toString("hex"),
      onFocus(event) {
        send({ type: "CHANNEL_INPUT.FOCUS", channel: "hex" })
        raf(() => event.target.select())
      },
      onBlur(event) {
        const value = event.currentTarget.value
        send({ type: "CHANNEL_INPUT.BLUR", channel: "hex", value, isTextField: true })
      },
      onKeyDown(event) {
        if (event.key === "Enter") {
          const value = event.currentTarget.value
          send({ type: "CHANNEL_INPUT.CHANGE", channel: "hex", value, isTextField: true })
          event.preventDefault()
        }
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
      hidden: !isOpen,
    }),

    getAreaProps(props) {
      const { xChannel, yChannel } = getResolvedChannels(props)
      const { areaStyles } = getColorAreaGradient(value, {
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

    getAreaBackgroundProps(props) {
      const { xChannel, yChannel } = getResolvedChannels(props)
      const { areaGradientStyles } = getColorAreaGradient(value, {
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

    getAreaThumbProps(props) {
      const { xChannel, yChannel } = getResolvedChannels(props)
      const channel = { xChannel, yChannel }

      const valueAsHSL = value.toFormat("hsl")
      const x = valueAsHSL.getChannelValuePercent(xChannel)
      const y = 1 - valueAsHSL.getChannelValuePercent(yChannel)

      return normalize.element({
        ...parts.areaThumb.attrs,
        id: dom.getAreaThumbId(state.context),
        dir: state.context.dir,
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
          background: value.withChannelValue("alpha", 1).toString("css"),
        },
        onFocus() {
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

    getTransparencyGridProps(props) {
      const { size } = props
      return normalize.element({
        ...parts.transparancyGrid.attrs,
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
          backgroundImage: getSliderBackground(state.context, { orientation, channel }),
        },
      })
    },

    getChannelSliderThumbProps(props) {
      const { orientation = "horizontal", channel } = props
      const { minValue, maxValue, step: stepValue } = value.getChannelRange(channel)
      const channelValue = value.getChannelValue(channel)

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
        style: {
          forcedColorAdjust: "none",
          position: "absolute",
          background: getChannelDisplayColor(value, channel).toString("css"),
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
      const range = getChannelInputRange(value, channel)

      return normalize.input({
        ...parts.channelInput.attrs,
        type: isTextField ? "text" : "number",
        "data-channel": channel,
        "aria-label": channel,
        disabled: isDisabled,
        "data-disabled": dataAttr(isDisabled),
        readOnly: state.context.readOnly,
        id: dom.getChannelInputId(state.context, channel),
        defaultValue: getChannelInputValue(value, channel),
        min: range?.minValue,
        max: range?.maxValue,
        step: range?.step,
        onBeforeInput(event) {
          if (isTextField) return
          const value = event.currentTarget.value
          if (value.match(/[^0-9.]/g)) {
            event.preventDefault()
          }
        },
        onFocus(event) {
          send({ type: "CHANNEL_INPUT.FOCUS", channel })
          event.target.select()
        },
        onBlur(event) {
          const value = event.currentTarget.value
          send({ type: "CHANNEL_INPUT.BLUR", channel, value, isTextField })
        },
        onKeyDown(event) {
          if (event.key === "Enter") {
            const value = event.currentTarget.valueAsNumber
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

    getSwatchTriggerProps(props) {
      const { value: valueProp } = props
      const color = normalizeColor(valueProp).toFormat(value.getFormat())
      return normalize.button({
        ...parts.swatchTrigger.attrs,
        disabled: isDisabled,
        type: "button",
        "data-value": color.toString("hex"),
        onClick() {
          if (!isInteractive) return
          send({ type: "VALUE.SET", value: color })
        },
        style: {
          position: "relative",
        },
      })
    },

    getSwatchProps(props) {
      const { value: valueProp, respectAlpha = true } = props
      const colorValue = normalizeColor(valueProp)
      const color = colorValue.toFormat(value.getFormat())
      return normalize.element({
        ...parts.swatch.attrs,
        "data-state": colorValue.isEqual(value) ? "selected" : "unselected",
        "data-value": color.toString("hex"),
        style: {
          position: "relative",
          background: color.toString(respectAlpha ? "css" : "hex"),
        },
      })
    },
  }
}
