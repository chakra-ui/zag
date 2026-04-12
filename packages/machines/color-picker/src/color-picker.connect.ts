import { getColorAreaGradient, isInSrgbGamut, normalizeColor } from "@zag-js/color-utils"
import { getEventKey, getEventPoint, getEventStep, isLeftClick, isModifierKey } from "@zag-js/dom-query"
import { dataAttr, query, visuallyHiddenStyle } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes, EventKeyMap } from "@zag-js/types"
import { parts } from "./color-picker.anatomy"
import * as dom from "./color-picker.dom"
import type {
  AreaProps,
  ColorFormat,
  ColorPickerService,
  ColorPickerApi,
  GamutOverlayProps,
  SwatchTriggerProps,
  SwatchTriggerState,
} from "./color-picker.types"
import { getChannelDisplayColor } from "./utils/get-channel-display-color"
import { getChannelRange, getChannelValue } from "./utils/get-channel-input-value"
import { getGamutOverlayData } from "./utils/get-gamut-overlay-path"
import { getSliderBackground } from "./utils/get-slider-background"

export function connect<T extends PropTypes>(
  service: ColorPickerService,
  normalize: NormalizeProps<T>,
): ColorPickerApi<T> {
  const { context, send, prop, computed, state, scope } = service

  const value = context.get("value")
  const format = context.get("format")

  const areaValue = computed("areaValue")
  const stableAreaValue = context.get("areaBaseColor") ?? areaValue
  const valueAsString = computed("valueAsString")

  const disabled = computed("disabled")
  const readOnly = !!prop("readOnly")
  const invalid = !!prop("invalid")
  const required = !!prop("required")
  const interactive = computed("interactive")

  const dragging = state.hasTag("dragging")
  const open = state.hasTag("open")
  const focused = state.hasTag("focused")

  const getAreaChannels = (props: AreaProps) => {
    const channels = areaValue.getChannels()
    return {
      xChannel: props.xChannel ?? channels[1],
      yChannel: props.yChannel ?? channels[2],
    }
  }

  function getDefaultDevicePixelRatio(): number {
    if (typeof globalThis === "undefined") return 1
    const dpr = (globalThis as { devicePixelRatio?: number }).devicePixelRatio
    return typeof dpr === "number" && Number.isFinite(dpr) ? dpr : 1
  }

  function resolveGamutOverlay(props: GamutOverlayProps = {}) {
    const pixelRatio = props.pixelRatio ?? getDefaultDevicePixelRatio()
    return getGamutOverlayData(stableAreaValue, getAreaChannels(props), format, { pixelRatio })
  }

  const currentPlacement = context.get("currentPlacement")
  const popperStyles = getPlacementStyles({
    ...prop("positioning"),
    placement: currentPlacement,
    positioned: context.get("positioned"),
  })

  function getSwatchTriggerState(props: SwatchTriggerProps): SwatchTriggerState {
    const color = normalizeColor(props.value).toFormat(context.get("format"))
    return {
      value: color,
      valueAsString: color.toString("hex"),
      checked: color.isEqual(value),
      disabled: props.disabled || !interactive,
    }
  }

  return {
    dragging,
    open,
    valueAsString,
    value,
    isInSrgbGamut: isInSrgbGamut(value),
    getGamutOverlay(props = {}) {
      return resolveGamutOverlay(props)
    },
    inline: !!prop("inline"),
    setOpen(nextOpen) {
      if (prop("inline")) return
      const open = state.hasTag("open")
      if (open === nextOpen) return
      send({ type: nextOpen ? "OPEN" : "CLOSE" })
    },
    setValue(value) {
      send({ type: "VALUE.SET", value: normalizeColor(value), src: "set-color" })
    },
    getChannelValue(channel) {
      return getChannelValue(value, channel)
    },
    getChannelValueText(channel, locale) {
      return value.formatChannelValue(channel, locale)
    },
    setChannelValue(channel, channelValue) {
      const color = value.withChannelValue(channel, channelValue)
      send({ type: "VALUE.SET", value: color, src: "set-channel" })
    },
    format: context.get("format"),
    setFormat(nextFormat) {
      send({ type: "FORMAT.SET", format: nextFormat, src: "set-format" })
    },
    alpha: value.getChannelValue("alpha"),
    setAlpha(alphaValue) {
      const color = value.withChannelValue("alpha", alphaValue)
      send({ type: "VALUE.SET", value: color, src: "set-alpha" })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs(scope.id),
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
        "data-invalid": dataAttr(invalid),
        style: {
          "--value": value.toString("css"),
        },
      })
    },

    getLabelProps() {
      return normalize.element({
        ...parts.label.attrs(scope.id),
        dir: prop("dir"),
        id: dom.getLabelId(scope),
        htmlFor: dom.getHiddenInputId(scope),
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
        "data-invalid": dataAttr(invalid),
        "data-required": dataAttr(required),
        "data-focus": dataAttr(focused),
        onClick(event) {
          event.preventDefault()
          const inputEl = query(dom.getControlEl(scope), "[data-channel=hex]")
          inputEl?.focus({ preventScroll: true })
        },
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs(scope.id),
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
        "data-invalid": dataAttr(invalid),
        "data-state": open ? "open" : "closed",
        "data-focus": dataAttr(focused),
      })
    },

    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs(scope.id),
        id: dom.getTriggerId(scope),
        dir: prop("dir"),
        disabled: disabled,
        "aria-label": `select color. current color is ${valueAsString}`,
        "aria-controls": dom.getContentId(scope),
        "aria-labelledby": dom.getLabelId(scope),
        "aria-haspopup": prop("inline") ? undefined : "dialog",
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
        "data-invalid": dataAttr(invalid),
        "data-placement": currentPlacement,
        "aria-expanded": open,
        "data-state": open ? "open" : "closed",
        "data-focus": dataAttr(focused),
        type: "button",
        onClick() {
          if (!interactive) return
          send({ type: "TRIGGER.CLICK" })
        },
        onBlur() {
          if (!interactive) return
          send({ type: "TRIGGER.BLUR" })
        },
        style: {
          position: "relative",
        },
      })
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs(scope.id),
        dir: prop("dir"),
        style: popperStyles.floating,
      })
    },

    getContentProps() {
      return normalize.element({
        ...parts.content.attrs(scope.id),
        id: dom.getContentId(scope),
        dir: prop("dir"),
        role: prop("inline") ? undefined : "dialog",
        tabIndex: -1,
        "data-placement": currentPlacement,
        "data-state": open ? "open" : "closed",
        hidden: !open,
      })
    },

    getValueTextProps() {
      return normalize.element({
        ...parts.valueText.attrs(scope.id),
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-focus": dataAttr(focused),
      })
    },

    getAreaProps(props = {}) {
      const { xChannel, yChannel } = getAreaChannels(props)
      const { areaStyles } = getColorAreaGradient(stableAreaValue, {
        xChannel,
        yChannel,
        dir: prop("dir"),
      })

      return normalize.element({
        ...parts.area.attrs(scope.id),
        role: "group",
        "data-invalid": dataAttr(invalid),
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
        onPointerDown(event) {
          if (!interactive) return
          if (!isLeftClick(event)) return
          if (isModifierKey(event)) return

          const point = getEventPoint(event)
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
      const { areaGradientStyles } = getColorAreaGradient(stableAreaValue, {
        xChannel,
        yChannel,
        dir: prop("dir"),
      })

      return normalize.element({
        ...parts.areaBackground.attrs(scope.id),
        "data-invalid": dataAttr(invalid),
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
        style: {
          position: "relative",
          touchAction: "none",
          forcedColorAdjust: "none",
          ...areaGradientStyles,
        },
      })
    },

    getGamutOverlayProps(props = {}) {
      const data = resolveGamutOverlay(props)
      return normalize.element({
        ...parts.gamutOverlay.attrs(scope.id),
        viewBox: "0 0 100 100",
        preserveAspectRatio: "none",
        xmlns: "http://www.w3.org/2000/svg",
        "aria-hidden": true,
        "data-state": data ? "visible" : "hidden",
        style: {
          position: "absolute",
          inset: "0",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          pointerEvents: "none",
        },
      })
    },

    getAreaThumbProps(props = {}) {
      const { xChannel, yChannel } = getAreaChannels(props)
      const channel = { xChannel, yChannel }

      const dragPos = context.get("areaDragPosition")
      const isRtl = prop("dir") === "rtl"

      let xPercent: number
      let yPercent: number
      if (dragPos) {
        xPercent = dragPos.x
        yPercent = dragPos.y
      } else {
        xPercent = areaValue.getChannelValuePercent(xChannel)
        yPercent = 1 - areaValue.getChannelValuePercent(yChannel)
      }
      const finalXPercent = isRtl ? 1 - xPercent : xPercent

      const xValue = areaValue.getChannelValue(xChannel)
      const yValue = areaValue.getChannelValue(yChannel)

      const color = areaValue.withChannelValue("alpha", 1).toString("css")

      return normalize.element({
        ...parts.areaThumb.attrs(scope.id),
        id: dom.getAreaThumbId(scope),
        dir: prop("dir"),
        tabIndex: disabled ? undefined : 0,
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        role: "slider",
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuenow": xValue,
        "aria-label": `${xChannel} and ${yChannel}`,
        "aria-roledescription": "2d slider",
        "aria-valuetext": `${xChannel} ${xValue}, ${yChannel} ${yValue}`,
        style: {
          position: "absolute",
          left: `${finalXPercent * 100}%`,
          top: `${yPercent * 100}%`,
          transform: "translate(-50%, -50%)",
          touchAction: "none",
          forcedColorAdjust: "none",
          "--color": color,
          background: color,
        },
        onFocus() {
          if (!interactive) return
          send({ type: "AREA.FOCUS", id: "area", channel })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (!interactive) return

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

          const exec =
            keyMap[
              getEventKey(event, {
                dir: prop("dir"),
              })
            ]

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
        ...parts.transparencyGrid.attrs(scope.id),
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
      const { orientation = "horizontal", channel, format } = props
      return normalize.element({
        ...parts.channelSlider.attrs(scope.id),
        "data-channel": channel,
        "data-orientation": orientation,
        role: "presentation",
        onPointerDown(event) {
          if (!interactive) return
          if (!isLeftClick(event)) return
          if (isModifierKey(event)) return

          const point = getEventPoint(event)
          send({ type: "CHANNEL_SLIDER.POINTER_DOWN", channel, format, point, id: channel, orientation })

          event.preventDefault()
        },
        style: {
          position: "relative",
          touchAction: "none",
        },
      })
    },

    getChannelSliderTrackProps(props) {
      const { orientation = "horizontal", channel, format } = props
      const normalizedValue = format ? value.toFormat(format) : stableAreaValue

      return normalize.element({
        ...parts.channelSliderTrack.attrs(scope.id),
        role: "group",
        "data-channel": channel,
        "data-orientation": orientation,
        style: {
          position: "relative",
          forcedColorAdjust: "none",
          backgroundImage: getSliderBackground({
            orientation,
            channel,
            dir: prop("dir"),
            value: normalizedValue,
          }),
        },
      })
    },

    getChannelSliderLabelProps(props) {
      const { channel } = props
      return normalize.element({
        ...parts.channelSliderLabel.attrs(scope.id),
        "data-channel": channel,
        onClick(event) {
          if (!interactive) return
          event.preventDefault()
          const thumbId = dom.getChannelSliderThumbId(scope, channel)
          scope.getById(thumbId)?.focus({ preventScroll: true })
        },
        style: {
          userSelect: "none",
          WebkitUserSelect: "none",
        },
      })
    },

    getChannelSliderValueTextProps(props) {
      return normalize.element({
        ...parts.channelSliderValueText.attrs(scope.id),
        "data-channel": props.channel,
      })
    },

    getChannelSliderThumbProps(props) {
      const { orientation = "horizontal", channel, format } = props

      const normalizedValue = format ? value.toFormat(format) : stableAreaValue
      const channelRange = normalizedValue.getChannelRange(channel)
      const channelValue = normalizedValue.getChannelValue(channel)

      const offset = (channelValue - channelRange.minValue) / (channelRange.maxValue - channelRange.minValue)
      const isRtl = prop("dir") === "rtl"
      const finalOffset = orientation === "horizontal" && isRtl ? 1 - offset : offset

      const placementStyles =
        orientation === "horizontal"
          ? { left: `${finalOffset * 100}%`, top: "50%" }
          : { top: `${offset * 100}%`, left: "50%" }

      return normalize.element({
        ...parts.channelSliderThumb.attrs(scope.id),
        id: dom.getChannelSliderThumbId(scope, channel),
        role: "slider",
        "aria-label": channel,
        tabIndex: disabled ? undefined : 0,
        "data-channel": channel,
        "data-disabled": dataAttr(disabled),
        "data-orientation": orientation,
        "aria-disabled": dataAttr(disabled),
        "aria-orientation": orientation,
        "aria-valuemax": channelRange.maxValue,
        "aria-valuemin": channelRange.minValue,
        "aria-valuenow": channelValue,
        "aria-valuetext": `${channel} ${channelValue}`,
        style: {
          forcedColorAdjust: "none",
          position: "absolute",
          background: getChannelDisplayColor(stableAreaValue, channel).toString("css"),
          ...placementStyles,
        },
        onFocus() {
          if (!interactive) return
          send({ type: "CHANNEL_SLIDER.FOCUS", channel })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (!interactive) return

          const step = getEventStep(event) * channelRange.step

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

          const exec =
            keyMap[
              getEventKey(event, {
                dir: prop("dir"),
              })
            ]

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
      const channelRange = getChannelRange(value, channel)

      return normalize.input({
        ...parts.channelInput.attrs(scope.id),
        dir: prop("dir"),
        type: isTextField ? "text" : "number",
        "data-channel": channel,
        "aria-label": channel,
        spellCheck: false,
        autoComplete: "off",
        disabled: disabled,
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        readOnly: readOnly,
        defaultValue: getChannelValue(value, channel),
        min: channelRange?.minValue,
        max: channelRange?.maxValue,
        step: channelRange?.step,
        onBeforeInput(event) {
          if (isTextField || !interactive) return
          const value = event.currentTarget.value
          if (value.match(/[^0-9.]/g)) {
            event.preventDefault()
          }
        },
        onFocus(event) {
          if (!interactive) return
          send({ type: "CHANNEL_INPUT.FOCUS", channel })
          event.currentTarget.select()
        },
        onBlur(event) {
          if (!interactive) return
          const value = isTextField ? event.currentTarget.value : event.currentTarget.valueAsNumber
          send({ type: "CHANNEL_INPUT.BLUR", channel, value, isTextField })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (!interactive) return
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

    getHiddenInputProps() {
      return normalize.input({
        type: "text",
        disabled,
        name: prop("name"),
        tabIndex: -1,
        readOnly,
        required,
        id: dom.getHiddenInputId(scope),
        style: visuallyHiddenStyle,
        defaultValue: valueAsString,
      })
    },

    getEyeDropperTriggerProps() {
      return normalize.button({
        ...parts.eyeDropperTrigger.attrs(scope.id),
        type: "button",
        dir: prop("dir"),
        disabled: disabled,
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        "aria-label": "Pick a color from the screen",
        onClick() {
          if (!interactive) return
          send({ type: "EYEDROPPER.CLICK" })
        },
      })
    },

    getSwatchGroupProps() {
      return normalize.element({
        ...parts.swatchGroup.attrs(scope.id),
        role: "group",
      })
    },

    getSwatchTriggerState,

    getSwatchTriggerProps(props) {
      const swatchState = getSwatchTriggerState(props)
      return normalize.button({
        ...parts.swatchTrigger.attrs(scope.id),
        disabled: swatchState.disabled,
        dir: prop("dir"),
        type: "button",
        "aria-label": `select ${swatchState.valueAsString} as the color`,
        "data-state": swatchState.checked ? "checked" : "unchecked",
        "data-value": swatchState.valueAsString,
        "data-disabled": dataAttr(swatchState.disabled),
        onClick() {
          if (swatchState.disabled) return
          send({ type: "SWATCH_TRIGGER.CLICK", value: swatchState.value })
        },
        style: {
          "--color": swatchState.valueAsString,
          position: "relative",
        },
      })
    },

    getSwatchIndicatorProps(props) {
      const swatchState = getSwatchTriggerState(props)
      return normalize.element({
        ...parts.swatchIndicator.attrs(scope.id),
        dir: prop("dir"),
        hidden: !swatchState.checked,
      })
    },

    getSwatchProps(props) {
      const { respectAlpha = true } = props
      const swatchState = getSwatchTriggerState(props)
      const color = swatchState.value.toString(respectAlpha ? "css" : "hex")
      return normalize.element({
        ...parts.swatch.attrs(scope.id),
        dir: prop("dir"),
        "data-state": swatchState.checked ? "checked" : "unchecked",
        "data-value": swatchState.valueAsString,
        style: {
          "--color": color,
          position: "relative",
          background: color,
        },
      })
    },

    getFormatTriggerProps() {
      return normalize.button({
        ...parts.formatTrigger.attrs(scope.id),
        dir: prop("dir"),
        type: "button",
        "aria-label": `change color format to ${getNextFormat(format)}`,
        onClick(event) {
          if (event.currentTarget.disabled) return
          const nextFormat = getNextFormat(format)
          send({ type: "FORMAT.SET", format: nextFormat, src: "format-trigger" })
        },
      })
    },

    getFormatSelectProps() {
      return normalize.select({
        ...parts.formatSelect.attrs(scope.id),
        "aria-label": "change color format",
        dir: prop("dir"),
        defaultValue: prop("format"),
        disabled: disabled,
        onChange(event) {
          const format = assertFormat(event.currentTarget.value)
          send({ type: "FORMAT.SET", format, src: "format-select" })
        },
      })
    },
  }
}

const formats: ColorFormat[] = ["hsba", "hsla", "rgba", "oklab", "oklch"]
const formatRegex = new RegExp(`^(${formats.join("|")})$`)

function getNextFormat(format: ColorFormat) {
  const index = formats.indexOf(format)
  return formats[index + 1] ?? formats[0]
}

function assertFormat(format: string) {
  if (formatRegex.test(format)) return format as ColorFormat
  throw new Error(`Unsupported color format: ${format}`)
}
