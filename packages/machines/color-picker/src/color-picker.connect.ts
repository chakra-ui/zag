import {
  getChannelGradient,
  getChannelThumbColor,
  getColorAreaGradient,
  getSrgbGamutPath,
  isInSrgbGamut,
  normalizeColor,
} from "@zag-js/utils/color"
import { getDismissableLayerAttrs, getDismissableLayerStyle } from "@zag-js/dismissable"
import {
  getEventKey,
  getEventMove,
  getEventPoint,
  getEventStep,
  isComposingEvent,
  isLeftClick,
  isModifierKey,
} from "@zag-js/dom-query"
import { ariaAttr, dataAttr, query, visuallyHiddenStyle } from "@zag-js/dom-query"
import { mergeWithDefault } from "@zag-js/utils/object"
import { getPlacementSide, getPlacementStyles } from "@zag-js/popper"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./color-picker.anatomy"
import * as dom from "./color-picker.dom"
import type {
  AreaProps,
  ColorFormat,
  ColorPickerService,
  ColorPickerApi,
  ContentState,
  GamutOverlayProps,
  ExtendedColorChannel,
  IntlTranslations,
  RootState,
  SwatchTriggerProps,
  SwatchTriggerState,
  TriggerState,
} from "./color-picker.types"
import { getChannelRange, getChannelValue } from "./utils/get-channel-input-value"

const channelLabels: Record<ExtendedColorChannel, string> = {
  hue: "Hue",
  saturation: "Saturation",
  brightness: "Brightness",
  lightness: "Lightness",
  red: "Red",
  green: "Green",
  blue: "Blue",
  a: "A",
  b: "B",
  chroma: "Chroma",
  alpha: "Alpha",
  hex: "Hex",
  css: "CSS color",
}

const defaultTranslations: Required<IntlTranslations> = {
  triggerLabel: (valueAsString) => `select color. current color is ${valueAsString}`,
  channelLabel: (channel) => channelLabels[channel],
  areaThumbLabel: ({ xLabel, yLabel }) => `${xLabel} and ${yLabel}`,
  areaThumbRoleDescription: "2d slider",
  eyeDropperTriggerLabel: "Pick a color from the screen",
  swatchTriggerLabel: (valueAsString) => `select ${valueAsString} as the color`,
  formatTriggerLabel: (nextFormat) => `change color format to ${nextFormat}`,
  formatSelectLabel: "change color format",
}

function getDefaultDevicePixelRatio(): number {
  const dpr = (globalThis as { devicePixelRatio?: number }).devicePixelRatio
  return Number.isFinite(dpr) ? dpr! : 1
}

const AREA_KEYS: Record<string, { axis: "x" | "y"; direction: number; page?: boolean }> = {
  ArrowUp: { axis: "y", direction: 1 },
  ArrowDown: { axis: "y", direction: -1 },
  ArrowLeft: { axis: "x", direction: -1 },
  ArrowRight: { axis: "x", direction: 1 },
  PageUp: { axis: "y", direction: 1, page: true },
  PageDown: { axis: "y", direction: -1, page: true },
  Home: { axis: "x", direction: -1, page: true },
  End: { axis: "x", direction: 1, page: true },
}

export function connect<T extends PropTypes>(
  service: ColorPickerService,
  normalize: NormalizeProps<T>,
): ColorPickerApi<T> {
  const { context, send, prop, computed, state, scope, refs } = service
  const layer = context.get("layer")

  const value = context.get("value")
  const format = context.get("format")
  const locale = prop("locale")
  const translations = mergeWithDefault(defaultTranslations, prop("translations"))

  const areaValue = computed("areaValue")
  const valueAsString = computed("valueAsString")

  const disabled = computed("disabled")
  const readOnly = !!prop("readOnly")
  const invalid = !!prop("invalid")
  const required = !!prop("required")
  const interactive = computed("interactive")

  const dir = prop("dir")
  const fieldAttrs = {
    "data-disabled": dataAttr(disabled),
    "data-readonly": dataAttr(readOnly),
    "data-invalid": dataAttr(invalid),
  }

  const eyeDropperSupported = context.get("platform").supportsEyeDropper
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

  function resolveGamutOverlay(props: GamutOverlayProps = {}) {
    if (format !== "oklch" && format !== "oklab") return null
    const { xChannel, yChannel } = getAreaChannels(props)
    if (xChannel !== "saturation" || yChannel !== "brightness") return null
    const pixelRatio = props.pixelRatio ?? getDefaultDevicePixelRatio()
    return getSrgbGamutPath(areaValue.getChannelValue("hue"), pixelRatio)
  }

  const getAreaGradient = (props: AreaProps) => getColorAreaGradient(areaValue, { ...getAreaChannels(props), dir })

  const currentPlacement = context.get("currentPlacement")
  const currentPlacementSide = currentPlacement ? getPlacementSide(currentPlacement) : undefined
  const popperStyles = getPlacementStyles({
    ...prop("positioning"),
    placement: currentPlacement,
  })

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getSwatchTriggerState(props: SwatchTriggerProps): SwatchTriggerState {
    const color = normalizeColor(props.value).toFormat(format)
    return {
      value: color,
      valueAsString: color.toString("hex"),
      checked: color.isEqual(value),
      disabled: props.disabled || !interactive,
    }
  }

  function getRootState(): RootState {
    return { disabled, readOnly, invalid }
  }

  function getTriggerState(): TriggerState {
    return {
      open,
      focused,
      disabled,
      invalid,
      readOnly,
      placement: currentPlacement,
      side: currentPlacementSide,
    }
  }

  function getContentState(): ContentState {
    return {
      open,
      nested: !!layer?.nested,
      hasNested: !!layer?.hasNested,
      placement: currentPlacement,
      side: currentPlacementSide,
    }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

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
    setOpen(nextOpen, reason = "script") {
      if (prop("inline")) return
      send({ type: nextOpen ? "OPEN" : "CLOSE", src: reason, replaces: "open" })
    },
    setValue(value) {
      send({ type: "VALUE.SET", value: normalizeColor(value), src: "set-color" })
    },
    getChannelValue(channel) {
      return getChannelValue(value, channel)
    },
    getChannelValueText(channel, channelLocale = locale) {
      const color = channel === "alpha" || value.getChannels().includes(channel) ? value : areaValue
      return color.formatChannelValue(channel, channelLocale)
    },
    setChannelValue(channel, channelValue) {
      const color = value.withChannelValue(channel, channelValue)
      send({ type: "VALUE.SET", value: color, src: "set-channel" })
    },
    format: context.get("format"),
    setFormat(format) {
      send({ type: "FORMAT.SET", format, src: "set-format" })
    },
    alpha: value.getChannelValue("alpha"),
    setAlpha(alphaValue) {
      const color = value.withChannelValue("alpha", alphaValue)
      send({ type: "VALUE.SET", value: color, src: "set-alpha" })
    },

    getRootState,
    getRootProps() {
      return normalize.element({
        ...parts.root.attrs(scope.id),
        dir: dir,
        ...fieldAttrs,
        style: {
          "--value": value.toString("css"),
        },
      })
    },

    getLabelProps() {
      return normalize.element({
        ...parts.label.attrs(scope.id),
        dir: dir,
        id: dom.getLabelId(scope),
        htmlFor: dom.getHiddenInputId(scope),
        ...fieldAttrs,
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
        dir: dir,
        ...fieldAttrs,
        "data-state": open ? "open" : "closed",
        "data-focus": dataAttr(focused),
      })
    },

    getTriggerState,
    getTriggerProps() {
      const triggerState = getTriggerState()
      return normalize.button({
        ...parts.trigger.attrs(scope.id),
        id: dom.getTriggerId(scope),
        dir: dir,
        disabled: triggerState.disabled,
        "aria-label": translations.triggerLabel(valueAsString),
        "aria-controls": dom.getContentId(scope),
        "aria-labelledby": `${dom.getLabelId(scope)} ${dom.getTriggerId(scope)}`,
        "aria-haspopup": prop("inline") ? undefined : "dialog",
        "data-disabled": dataAttr(triggerState.disabled),
        "data-readonly": dataAttr(triggerState.readOnly),
        "data-invalid": dataAttr(triggerState.invalid),
        "data-placement": triggerState.placement,
        "data-side": triggerState.side,
        "aria-expanded": triggerState.open,
        "data-state": triggerState.open ? "open" : "closed",
        "data-focus": dataAttr(triggerState.focused),
        type: "button",
        onClick() {
          if (!interactive) return
          send({ type: "TRIGGER.CLICK", src: "trigger-click" })
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
        dir: dir,
        ...getDismissableLayerAttrs(layer),
        style: {
          ...popperStyles.floating,
          ...getDismissableLayerStyle(layer),
        },
      })
    },

    getContentState,
    getContentProps() {
      const contentState = getContentState()
      return normalize.element({
        ...parts.content.attrs(scope.id),
        id: dom.getContentId(scope),
        dir: dir,
        role: prop("inline") ? undefined : "dialog",
        tabIndex: -1,
        "data-placement": contentState.placement,
        "data-side": contentState.side,
        "data-state": contentState.open ? "open" : "closed",
        hidden: !contentState.open,
        ...getDismissableLayerAttrs(layer),
        style: getDismissableLayerStyle(layer, { pointerEvents: true }),
      })
    },

    getValueTextProps() {
      return normalize.element({
        ...parts.valueText.attrs(scope.id),
        dir: dir,
        "data-disabled": dataAttr(disabled),
        "data-focus": dataAttr(focused),
      })
    },

    getAreaProps(props = {}) {
      const { xChannel, yChannel } = getAreaChannels(props)
      const { areaStyles } = getAreaGradient(props)

      return normalize.element({
        ...parts.area.attrs(scope.id),
        role: "group",
        ...fieldAttrs,
        onPointerDown(event) {
          if (!interactive) return
          if (!isLeftClick(event)) return
          if (isModifierKey(event)) return

          const point = getEventPoint(event)
          const channel = { xChannel, yChannel }

          send({ type: "POINTER_DOWN", point, channel, id: "area" })
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
      const { areaGradientStyles } = getAreaGradient(props)

      return normalize.element({
        ...parts.areaBackground.attrs(scope.id),
        ...fieldAttrs,
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

      const { x, y } = context.get("areaDragPosition") ?? {
        x: areaValue.getChannelValuePercent(xChannel),
        y: 1 - areaValue.getChannelValuePercent(yChannel),
      }
      const xLabel = translations.channelLabel(xChannel)
      const yLabel = translations.channelLabel(yChannel)

      const xRange = areaValue.getChannelRange(xChannel)
      const yRange = areaValue.getChannelRange(yChannel)

      const color = areaValue.withChannelValue("alpha", 1).toString("css")

      return normalize.element({
        ...parts.areaThumb.attrs(scope.id),
        id: dom.getAreaThumbId(scope),
        dir: dir,
        tabIndex: disabled ? undefined : 0,
        ...fieldAttrs,
        role: "slider",
        "aria-disabled": ariaAttr(disabled),
        "aria-invalid": ariaAttr(invalid),
        "aria-valuemin": xRange.minValue,
        "aria-valuemax": xRange.maxValue,
        "aria-valuenow": areaValue.getChannelValue(xChannel),
        "aria-label": translations.areaThumbLabel({ xLabel, yLabel }),
        "aria-roledescription": translations.areaThumbRoleDescription,
        "aria-valuetext": `${xLabel} ${areaValue.formatChannelValue(xChannel, locale)}, ${yLabel} ${areaValue.formatChannelValue(yChannel, locale)}`,
        style: {
          position: "absolute",
          left: `${(dir === "rtl" ? 1 - x : x) * 100}%`,
          top: `${y * 100}%`,
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

          const key = getEventKey(event, { dir })
          if (key === "Escape") event.stopPropagation()
          const move = AREA_KEYS[key]
          if (move) {
            const isX = move.axis === "x"
            const step = move.page ? (isX ? xRange : yRange).pageSize : getEventStep(event)
            send({ type: "CHANNEL.STEP", channel: isX ? xChannel : yChannel, step: move.direction * step })
          } else if (key !== "Escape") return
          event.preventDefault()
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
          send({ type: "POINTER_DOWN", channel, format, point, id: channel, orientation })

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
      const normalizedValue = format ? value.toFormat(format) : areaValue

      return normalize.element({
        ...parts.channelSliderTrack.attrs(scope.id),
        role: "group",
        "data-channel": channel,
        "data-orientation": orientation,
        style: {
          position: "relative",
          forcedColorAdjust: "none",
          backgroundImage: getChannelGradient(
            normalizedValue,
            channel,
            orientation === "vertical" ? "top" : dir === "rtl" ? "left" : "right",
          ),
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

      const normalizedValue = format ? value.toFormat(format) : areaValue
      const channelRange = normalizedValue.getChannelRange(channel)
      const channelValue = normalizedValue.getChannelValue(channel)

      const dragPercent = context.get("activeId") === channel ? context.get("sliderDragPercent") : null
      const offset = dragPercent ?? normalizedValue.getChannelValuePercent(channel)
      const placementStyles =
        orientation === "horizontal"
          ? { left: `${(dir === "rtl" ? 1 - offset : offset) * 100}%`, top: "50%" }
          : { top: `${(1 - offset) * 100}%`, left: "50%" }

      return normalize.element({
        ...parts.channelSliderThumb.attrs(scope.id),
        id: dom.getChannelSliderThumbId(scope, channel),
        role: "slider",
        "aria-label": translations.channelLabel(channel),
        tabIndex: disabled ? undefined : 0,
        "data-channel": channel,
        "data-disabled": dataAttr(disabled),
        "data-orientation": orientation,
        "aria-disabled": ariaAttr(disabled),
        "aria-invalid": ariaAttr(invalid),
        "aria-orientation": orientation,
        "aria-valuemax": channelRange.maxValue,
        "aria-valuemin": channelRange.minValue,
        "aria-valuenow": channelValue,
        "aria-valuetext": normalizedValue.formatChannelValue(channel, locale),
        style: {
          forcedColorAdjust: "none",
          position: "absolute",
          background: getChannelThumbColor(areaValue, channel).toString("css"),
          ...placementStyles,
        },
        onFocus() {
          if (!interactive) return
          send({ type: "CHANNEL_SLIDER.FOCUS", channel })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (!interactive) return

          if (event.key === "Escape") {
            event.stopPropagation()
            return
          }

          const move = getEventMove(event, { dir: dir })
          if (!move) return

          if ("bound" in move) {
            send({ type: "CHANNEL.STEP", channel, format, bound: move.bound })
          } else {
            // Page keys move a page; Shift moves ten steps
            const { pageSize, step } = channelRange
            const size = event.key.startsWith("Page") ? pageSize : move.size === "large" ? step * 10 : step
            send({ type: "CHANNEL.STEP", channel, format, step: move.direction * size })
          }
          event.preventDefault()
        },
      })
    },

    getChannelInputProps(props) {
      const { channel } = props

      const isTextField = channel === "hex" || channel === "css"
      const channelRange = getChannelRange(value, channel)
      const draft = refs.get("channelDraft")

      return normalize.input({
        ...parts.channelInput.attrs(scope.id),
        dir: dir,
        type: isTextField ? "text" : "number",
        "data-channel": channel,
        "aria-label": translations.channelLabel(channel),
        "aria-invalid": ariaAttr(invalid),
        spellCheck: false,
        autoComplete: "off",
        disabled: disabled,
        ...fieldAttrs,
        readOnly: readOnly,
        defaultValue: draft?.channel === channel ? draft.value : getChannelValue(value, channel),
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
          refs.set("channelDraft", null)
          send({ type: "CHANNEL_INPUT.FOCUS", channel })
          event.currentTarget.select()
        },
        onInput(event) {
          if (!interactive) return
          refs.set("channelDraft", { channel, value: event.currentTarget.value, el: event.currentTarget })
        },
        onBlur(event) {
          if (!interactive) return
          refs.set("channelDraft", null)
          const value = isTextField ? event.currentTarget.value : event.currentTarget.valueAsNumber
          send({ type: "CHANNEL_INPUT.BLUR", channel, value, isTextField })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (!interactive) return
          if (isComposingEvent(event)) return

          const inputEl = event.currentTarget
          const commit = (value: string | number) => {
            refs.set("channelDraft", null)
            send({ type: "CHANNEL_INPUT.CHANGE", channel, value, isTextField })
          }
          const stepBy = (direction: number) => {
            const count = getEventStep(event)
            if (direction > 0) inputEl.stepUp(count)
            else inputEl.stepDown(count)
            commit(inputEl.valueAsNumber)
          }

          const keyMap: EventKeyMap = {
            Enter() {
              commit(isTextField ? inputEl.value : inputEl.valueAsNumber)
            },
            ...(!isTextField && {
              ArrowUp: () => stepBy(1),
              ArrowDown: () => stepBy(-1),
            }),
          }

          const exec = keyMap[event.key]
          if (exec) {
            exec(event)
            event.preventDefault()
          }
        },
        style: {
          appearance: "textfield",
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
        dir: dir,
        disabled: disabled || !eyeDropperSupported,
        ...fieldAttrs,
        "data-disabled": dataAttr(disabled || !eyeDropperSupported),
        "data-unsupported": dataAttr(!eyeDropperSupported),
        "aria-label": translations.eyeDropperTriggerLabel,
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
        dir: dir,
        type: "button",
        "aria-label": translations.swatchTriggerLabel(swatchState.valueAsString),
        "aria-pressed": swatchState.checked,
        "data-state": swatchState.checked ? "checked" : "unchecked",
        "data-value": swatchState.valueAsString,
        "data-disabled": dataAttr(swatchState.disabled),
        onClick() {
          if (swatchState.disabled) return
          send({ type: "SWATCH_TRIGGER.CLICK", value: swatchState.value, src: "item-select" })
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
        dir: dir,
        hidden: !swatchState.checked,
      })
    },

    getSwatchProps(props) {
      const { respectAlpha = true } = props
      const swatchState = getSwatchTriggerState(props)
      const color = swatchState.value.toString(respectAlpha ? "css" : "hex")
      return normalize.element({
        ...parts.swatch.attrs(scope.id),
        dir: dir,
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
        dir: dir,
        type: "button",
        "aria-label": translations.formatTriggerLabel(getNextFormat(format)),
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
        "aria-label": translations.formatSelectLabel,
        dir: dir,
        defaultValue: format,
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

const getNextFormat = (format: ColorFormat) => formats[(formats.indexOf(format) + 1) % formats.length]

function assertFormat(format: string) {
  if (formats.includes(format as ColorFormat)) return format as ColorFormat
  throw new Error(`Unsupported color format: ${format}`)
}
