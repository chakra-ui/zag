import { parseColor, type Color } from "@zag-js/color-utils"
import { createGuards, createMachine, type Params, type Scope } from "@zag-js/core"
import { trackDismissableElement, type LayerSnapshot } from "@zag-js/dismissable"
import {
  AnimationFrame,
  disableTextSelection,
  dispatchInputValueEvent,
  getInitialFocus,
  isFocusOutside,
  setElementValue,
  trackFormControl,
  trackPointerMove,
} from "@zag-js/dom-query"
import { getPlacement, type Placement } from "@zag-js/popper"
import type { Orientation } from "@zag-js/types"
import { tryCatch } from "@zag-js/utils"
import * as dom from "./color-picker.dom"
import { parse } from "./color-picker.parse"
import type { ColorFormat, ColorPickerSchema, ExtendedColorChannel } from "./color-picker.types"
import { getAreaFormat } from "./utils/get-area-format"
import { getChannelValue } from "./utils/get-channel-input-value"
import { prefixHex } from "./utils/is-valid-hex"

const { and } = createGuards<ColorPickerSchema>()

const hashObject = (obj: Record<string, number>): string => {
  let hash = ""
  for (const key in obj) hash += `${key}:${obj[key] ?? ""};`
  return hash
}

const DEFAULT_COLOR = parse("#000000")

export const machine = createMachine<ColorPickerSchema>({
  props({ props }) {
    const color = props.value ?? props.defaultValue ?? DEFAULT_COLOR
    return {
      dir: "ltr",
      locale: "en-US",
      defaultValue: DEFAULT_COLOR,
      defaultFormat: color.getFormat(),
      openAutoFocus: true,
      ...props,
      positioning: {
        placement: "bottom",
        ...props.positioning,
      },
    }
  },

  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen") || prop("inline")
    return open ? "open" : "idle"
  },

  refs() {
    return {
      focusFrame: AnimationFrame.create(),
      inputSyncFrame: AnimationFrame.create(),
      formatSyncFrame: AnimationFrame.create(),
    }
  },

  context({ prop, bindable, getContext }) {
    return {
      layer: bindable<LayerSnapshot | null>(() => ({
        defaultValue: null,
      })),
      value: bindable<Color>(() => ({
        defaultValue: prop("defaultValue").toFormat(prop("format") ?? prop("defaultFormat")),
        value: prop("value")?.toFormat(prop("format") ?? prop("defaultFormat")),
        isEqual(a, b) {
          return b != null && a.isEqual(b)
        },
        hash(a) {
          return hashObject(a.toJSON())
        },
        onChange(value) {
          const ctx = getContext()
          const format = ctx.get("format")
          // Pass value as-is to preserve channel info (e.g., HSB saturation at black)
          // valueAsString is converted to the desired format for display
          prop("onValueChange")?.({ value, valueAsString: value.toString(format) })
        },
      })),
      format: bindable<ColorFormat>(() => ({
        defaultValue: prop("defaultFormat"),
        value: prop("format"),
        onChange(format) {
          prop("onFormatChange")?.({ format })
        },
      })),
      activeId: bindable<string | null>(() => ({ defaultValue: null })),
      activeChannel: bindable<any>(() => ({ defaultValue: null })),
      activeOrientation: bindable<Orientation | null>(() => ({ defaultValue: null })),
      editedColor: bindable<Color | null>(() => ({ defaultValue: null })),
      areaDragPosition: bindable<{ x: number; y: number } | null>(() => ({ defaultValue: null })),
      fieldsetDisabled: bindable<boolean>(() => ({ defaultValue: false })),
      restoreFocus: bindable<boolean>(() => ({ defaultValue: true })),
      currentPlacement: bindable<Placement | undefined>(() => ({
        defaultValue: undefined,
      })),
    }
  },

  computed: {
    rtl: ({ prop }) => prop("dir") === "rtl",
    disabled: ({ prop, context }) => !!prop("disabled") || context.get("fieldsetDisabled"),
    interactive: ({ prop }) => !(prop("disabled") || prop("readOnly")),
    valueAsString: ({ context }) => context.get("value").toString(context.get("format")),
    areaValue: ({ context }) => {
      const value = context.get("value")
      const format = context.get("format")
      const editedColor = context.get("editedColor")
      if (editedColor?.toFormat(format).isEqual(value)) return editedColor
      return value.toFormat(getAreaFormat(format))
    },
  },

  effects: ["trackFormControl"],

  entry: ["syncFormatSelectElement"],

  exit: ["cancelFrames"],

  watch({ prop, context, action, track }) {
    track([() => context.hash("value")], () => {
      action(["syncInputElements", "dispatchChangeEvent"])
    })

    track([() => context.get("format")], () => {
      action(["syncFormatSelectElement", "syncValueWithFormat"])
    })

    track([() => prop("open")], () => {
      action(["toggleVisibility"])
    })
  },

  on: {
    "VALUE.SET": {
      actions: ["setValue"],
    },
    "FORMAT.SET": {
      actions: ["setFormat"],
    },
    "CHANNEL_INPUT.CHANGE": {
      actions: ["setChannelColorFromInput"],
    },
    "EYEDROPPER.CLICK": {
      actions: ["openEyeDropper"],
    },
    "SWATCH_TRIGGER.CLICK": {
      actions: ["setValue", "invokeOnChangeEnd"],
    },
  },

  states: {
    idle: {
      tags: ["closed"],
      on: {
        "CONTROLLED.OPEN": {
          target: "open",
          actions: ["setInitialFocus"],
        },
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "setInitialFocus"],
          },
        ],
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "setInitialFocus"],
          },
        ],
        "CHANNEL_INPUT.FOCUS": {
          target: "focused",
          actions: ["setActiveChannel"],
        },
      },
    },

    focused: {
      id: "color-picker-focused",
      tags: ["closed", "focused"],
      on: {
        "CONTROLLED.OPEN": {
          target: "open",
          actions: ["setInitialFocus"],
        },
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "setInitialFocus"],
          },
        ],
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "setInitialFocus"],
          },
        ],
        "CHANNEL_INPUT.FOCUS": {
          actions: ["setActiveChannel"],
        },
        "CHANNEL_INPUT.BLUR": {
          target: "idle",
          actions: ["setChannelColorFromInput"],
        },
        "TRIGGER.BLUR": {
          target: "idle",
        },
      },
    },

    open: {
      tags: ["open"],
      effects: ["trackPositioning", "trackDismissableElement"],
      initial: "idle",
      on: {
        "CONTROLLED.CLOSE": [
          {
            guard: "shouldRestoreFocus",
            target: "focused",
            actions: ["setReturnFocus"],
          },
          {
            target: "idle",
          },
        ],
        INTERACT_OUTSIDE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            guard: "shouldRestoreFocus",
            target: "focused",
            actions: ["invokeOnClose", "setReturnFocus"],
          },
          {
            target: "idle",
            actions: ["invokeOnClose"],
          },
        ],
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "idle",
            actions: ["invokeOnClose"],
          },
        ],
      },
      states: {
        idle: {
          on: {
            "TRIGGER.CLICK": [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnClose"],
              },
              {
                target: "#color-picker-focused",
                actions: ["invokeOnClose"],
              },
            ],
            "AREA.POINTER_DOWN": {
              target: "dragging",
              actions: ["setActiveChannel", "setAreaColorFromPoint", "focusAreaThumb"],
            },
            "AREA.FOCUS": {
              actions: ["setActiveChannel"],
            },
            "CHANNEL_SLIDER.POINTER_DOWN": {
              target: "dragging",
              actions: ["setActiveChannel", "setChannelColorFromPoint", "focusChannelThumb"],
            },
            "CHANNEL_SLIDER.FOCUS": {
              actions: ["setActiveChannel"],
            },
            "AREA.ARROW_LEFT": {
              actions: ["decrementAreaXChannel", "invokeOnChangeEnd"],
            },
            "AREA.ARROW_RIGHT": {
              actions: ["incrementAreaXChannel", "invokeOnChangeEnd"],
            },
            "AREA.ARROW_UP": {
              actions: ["incrementAreaYChannel", "invokeOnChangeEnd"],
            },
            "AREA.ARROW_DOWN": {
              actions: ["decrementAreaYChannel", "invokeOnChangeEnd"],
            },
            "AREA.PAGE_UP": {
              actions: ["incrementAreaYChannel", "invokeOnChangeEnd"],
            },
            "AREA.PAGE_DOWN": {
              actions: ["decrementAreaYChannel", "invokeOnChangeEnd"],
            },
            "AREA.HOME": {
              actions: ["decrementAreaXChannel", "invokeOnChangeEnd"],
            },
            "AREA.END": {
              actions: ["incrementAreaXChannel", "invokeOnChangeEnd"],
            },
            "CHANNEL_SLIDER.ARROW_LEFT": {
              actions: ["decrementChannel", "invokeOnChangeEnd"],
            },
            "CHANNEL_SLIDER.ARROW_RIGHT": {
              actions: ["incrementChannel", "invokeOnChangeEnd"],
            },
            "CHANNEL_SLIDER.ARROW_UP": {
              actions: ["incrementChannel", "invokeOnChangeEnd"],
            },
            "CHANNEL_SLIDER.ARROW_DOWN": {
              actions: ["decrementChannel", "invokeOnChangeEnd"],
            },
            "CHANNEL_SLIDER.PAGE_UP": {
              actions: ["incrementChannel", "invokeOnChangeEnd"],
            },
            "CHANNEL_SLIDER.PAGE_DOWN": {
              actions: ["decrementChannel", "invokeOnChangeEnd"],
            },
            "CHANNEL_SLIDER.HOME": {
              actions: ["setChannelToMin", "invokeOnChangeEnd"],
            },
            "CHANNEL_SLIDER.END": {
              actions: ["setChannelToMax", "invokeOnChangeEnd"],
            },
            "CHANNEL_INPUT.BLUR": {
              actions: ["setChannelColorFromInput"],
            },
            "SWATCH_TRIGGER.CLICK": [
              {
                guard: and("isOpenControlled", "closeOnSelect"),
                actions: ["setValue", "invokeOnChangeEnd", "invokeOnClose"],
              },
              {
                guard: "closeOnSelect",
                target: "focused",
                actions: ["setValue", "invokeOnChangeEnd", "invokeOnClose", "setReturnFocus"],
              },
              {
                actions: ["setValue", "invokeOnChangeEnd"],
              },
            ],
          },
        },
        dragging: {
          tags: ["dragging"],
          exit: ["clearActiveChannel"],
          effects: ["trackPointerMove", "disableTextSelection"],
          on: {
            "AREA.POINTER_MOVE": {
              actions: ["setAreaColorFromPoint", "focusAreaThumb"],
            },
            "AREA.POINTER_UP": {
              target: "idle",
              actions: ["invokeOnChangeEnd"],
            },
            "CHANNEL_SLIDER.POINTER_MOVE": {
              actions: ["setChannelColorFromPoint", "focusChannelThumb"],
            },
            "CHANNEL_SLIDER.POINTER_UP": {
              target: "idle",
              actions: ["invokeOnChangeEnd"],
            },
          },
        },
      },
    },
  },

  implementations: {
    guards: {
      closeOnSelect: ({ prop }) => !!prop("closeOnSelect"),
      isOpenControlled: ({ prop }) => prop("open") != null || !!prop("inline"),
      shouldRestoreFocus: ({ context }) => !!context.get("restoreFocus"),
    },
    effects: {
      trackPositioning({ context, prop, scope }) {
        if (prop("inline")) return

        if (!context.get("currentPlacement")) {
          context.set("currentPlacement", prop("positioning")?.placement)
        }

        const anchorEl = dom.getTriggerEl(scope)
        const getPositionerEl = () => dom.getPositionerEl(scope)
        return getPlacement(anchorEl, getPositionerEl, {
          ...prop("positioning"),
          defer: true,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },
      trackDismissableElement({ context, scope, prop, send }) {
        if (prop("inline")) return

        const getContentEl = () => dom.getContentEl(scope)
        return trackDismissableElement(getContentEl, {
          type: "popover",
          onLayerChange(layer) {
            context.set("layer", layer)
          },
          exclude: dom.getTriggerEl(scope),
          defer: true,
          getRootNode: scope.getRootNode,
          onInteractOutside(event) {
            prop("onInteractOutside")?.(event)
            if (event.defaultPrevented) return
            context.set("restoreFocus", !(event.detail.focusable || event.detail.contextmenu))
          },
          onPointerDownOutside: prop("onPointerDownOutside"),
          onFocusOutside: prop("onFocusOutside"),
          onDismiss(event) {
            send({ type: "INTERACT_OUTSIDE", focusVisible: event?.type === "keydown" })
          },
        })
      },
      trackFormControl({ context, scope, send }) {
        const inputEl = dom.getHiddenInputEl(scope)
        return trackFormControl(inputEl, {
          onFieldsetDisabledChange(disabled) {
            context.set("fieldsetDisabled", disabled)
          },
          onFormReset() {
            send({ type: "VALUE.SET", value: context.initial("value"), src: "form.reset" })
          },
        })
      },
      trackPointerMove({ context, scope, event, send }) {
        return trackPointerMove(scope.getDoc(), {
          onPointerMove({ point }) {
            const type = context.get("activeId") === "area" ? "AREA.POINTER_MOVE" : "CHANNEL_SLIDER.POINTER_MOVE"
            send({ type, point, format: event.format, orientation: context.get("activeOrientation") ?? undefined })
          },
          onPointerUp() {
            const type = context.get("activeId") === "area" ? "AREA.POINTER_UP" : "CHANNEL_SLIDER.POINTER_UP"
            send({ type })
          },
        })
      },
      disableTextSelection({ scope }) {
        return disableTextSelection({
          doc: scope.getDoc(),
          target: dom.getContentEl(scope),
        })
      },
    },
    actions: {
      openEyeDropper({ scope, context, prop }) {
        const win = scope.getWin()
        const isSupported = "EyeDropper" in win
        if (!isSupported) return
        const picker = new win.EyeDropper()
        picker
          .open()
          .then(({ sRGBHex }) => {
            const format = context.get("value").getFormat()
            const color = parseColor(sRGBHex).toFormat(format) as Color
            context.set("value", color)
            return color
          })
          .then((value) => {
            prop("onValueChangeEnd")?.({
              value,
              valueAsString: value.toString(context.get("format")),
            })
          })
          .catch(() => void 0)
      },
      setActiveChannel({ context, event }) {
        context.set("activeId", event.id)
        if (event.channel) context.set("activeChannel", event.channel)
        if (event.orientation) context.set("activeOrientation", event.orientation)
      },
      clearActiveChannel({ context }) {
        context.set("activeChannel", null)
        context.set("activeId", null)
        context.set("activeOrientation", null)
        context.set("areaDragPosition", null)
      },
      setAreaColorFromPoint(params) {
        const { context, event, scope, prop } = params
        const { xChannel, yChannel } = event.channel || context.get("activeChannel")

        const percent = dom.getAreaValueFromPoint(scope, event.point, prop("dir"))
        if (!percent) return

        context.set("areaDragPosition", { x: percent.x, y: percent.y })

        editColor(params, event.format, (color) =>
          color
            .withChannelValue(xChannel, color.getChannelPercentValue(xChannel, percent.x))
            .withChannelValue(yChannel, color.getChannelPercentValue(yChannel, 1 - percent.y)),
        )
      },
      setChannelColorFromPoint(params) {
        const { context, event, scope, prop } = params
        const channel = event.channel || context.get("activeId")

        const percent = dom.getChannelSliderValueFromPoint(scope, event.point, channel, prop("dir"))
        if (!percent) return

        const orientation = event.orientation || context.get("activeOrientation") || "horizontal"
        const channelPercent = orientation === "horizontal" ? percent.x : percent.y

        editColor(params, event.format, (color) =>
          color.withChannelValue(channel, color.getChannelPercentValue(channel, channelPercent)),
        )
      },
      setValue({ context, event }) {
        const format = context.get("format")
        context.set("value", event.value.toFormat(format))
      },
      setFormat({ context, event }) {
        context.set("format", event.format)
      },
      dispatchChangeEvent({ scope, computed }) {
        dispatchInputValueEvent(dom.getHiddenInputEl(scope), { value: computed("valueAsString") })
      },
      syncInputElements({ context, scope, refs }) {
        syncChannelInputs(refs.get("inputSyncFrame"), scope, context.get("value"))
      },
      invokeOnChangeEnd({ context, prop, computed }) {
        prop("onValueChangeEnd")?.({
          value: context.get("value"),
          valueAsString: computed("valueAsString"),
        })
      },
      setChannelColorFromInput({ context, event, scope, prop, refs }) {
        const { channel, isTextField, value } = event
        const currentAlpha = context.get("value").getChannelValue("alpha")

        // handle other text channels
        let color: Color

        // handle alpha channel
        if (channel === "alpha") {
          //
          let valueAsNumber = parseFloat(value)
          valueAsNumber = Number.isNaN(valueAsNumber) ? currentAlpha : valueAsNumber
          color = context.get("value").withChannelValue("alpha", valueAsNumber)
          //
        } else if (isTextField) {
          //
          color = tryCatch(
            () => {
              const parseValue = channel === "hex" ? prefixHex(value) : value
              return parse(parseValue).withChannelValue("alpha", currentAlpha).toFormat(context.get("format"))
            },
            () => context.get("value"),
          )
          //
        } else {
          //
          const current = context.get("value").toFormat(context.get("format"))
          const valueAsNumber = Number.isNaN(value) ? current.getChannelValue(channel) : value
          color = current.withChannelValue(channel, valueAsNumber)
          //
        }

        // sync channel input value immediately (in event user types native css color, we need to convert it to the current channel format)
        syncChannelInputs(refs.get("inputSyncFrame"), scope, context.get("value"), color)

        // set new color
        context.set("value", color)

        // invoke change end
        prop("onValueChangeEnd")?.({
          value: color,
          valueAsString: color.toString(context.get("format")),
        })
      },
      incrementChannel(params) {
        const { channel, format, step } = params.event
        editColor(params, format, (color) => color.incrementChannel(channel, step))
      },
      decrementChannel(params) {
        const { channel, format, step } = params.event
        editColor(params, format, (color) => color.decrementChannel(channel, step))
      },
      incrementAreaXChannel(params) {
        const { channel, step } = params.event
        editColor(params, undefined, (color) => color.incrementChannel(channel.xChannel, step))
      },
      decrementAreaXChannel(params) {
        const { channel, step } = params.event
        editColor(params, undefined, (color) => color.decrementChannel(channel.xChannel, step))
      },
      incrementAreaYChannel(params) {
        const { channel, step } = params.event
        editColor(params, undefined, (color) => color.incrementChannel(channel.yChannel, step))
      },
      decrementAreaYChannel(params) {
        const { channel, step } = params.event
        editColor(params, undefined, (color) => color.decrementChannel(channel.yChannel, step))
      },
      setChannelToMax(params) {
        const { channel, format } = params.event
        editColor(params, format, (color) => color.withChannelValue(channel, color.getChannelRange(channel).maxValue))
      },
      setChannelToMin(params) {
        const { channel, format } = params.event
        editColor(params, format, (color) => color.withChannelValue(channel, color.getChannelRange(channel).minValue))
      },
      focusAreaThumb({ scope, refs }) {
        refs.get("focusFrame").request(() => {
          dom.getAreaThumbEl(scope)?.focus({ preventScroll: true })
        })
      },
      focusChannelThumb({ event, scope, refs }) {
        refs.get("focusFrame").request(() => {
          dom.getChannelSliderThumbEl(scope, event.channel)?.focus({ preventScroll: true })
        })
      },
      setInitialFocus({ prop, scope, refs }) {
        if (!prop("openAutoFocus")) return
        refs.get("focusFrame").request(() => {
          const element = getInitialFocus({
            root: dom.getContentEl(scope),
            getInitialEl: prop("initialFocusEl"),
          })
          if (!element) return
          element.focus({ preventScroll: true })
        })
      },
      setReturnFocus({ scope, event, refs }) {
        const contentEl = dom.getContentEl(scope)
        const focusOptions = getReturnFocusOptions(event)
        refs.get("focusFrame").request(() => {
          // Keep focus that moved elsewhere (e.g. from `onValueChange`)
          if (isFocusOutside(scope.getActiveElement(), [contentEl])) return
          dom.getTriggerEl(scope)?.focus(focusOptions)
        })
      },
      syncFormatSelectElement({ context, scope, refs }) {
        syncFormatSelect(refs.get("formatSyncFrame"), scope, context.get("format"))
      },
      cancelFrames({ refs }) {
        refs.get("focusFrame").cancel()
        refs.get("inputSyncFrame").cancel()
        refs.get("formatSyncFrame").cancel()
      },
      syncValueWithFormat({ context }) {
        const value = context.get("value")
        const newValue = value.toFormat(context.get("format"))
        if (newValue.isEqual(value)) return
        context.set("value", newValue)
      },
      invokeOnOpen({ prop, context }) {
        if (prop("inline")) return
        prop("onOpenChange")?.({ open: true, value: context.get("value") })
      },
      invokeOnClose({ prop, context }) {
        if (prop("inline")) return
        prop("onOpenChange")?.({ open: false, value: context.get("value") })
      },
      toggleVisibility({ prop, event, send }) {
        send({ type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: event })
      },
    },
  },
})

function syncChannelInputs(frame: AnimationFrame, scope: Scope, currentValue: Color, nextValue?: Color) {
  const channelInputEls = dom.getChannelInputEls(scope)
  frame.request(() => {
    channelInputEls.forEach((inputEl) => {
      const channel = inputEl.dataset.channel as ExtendedColorChannel | null
      setElementValue(inputEl, getChannelValue(nextValue || currentValue, channel))
    })
  })
}

function syncFormatSelect(frame: AnimationFrame, scope: Scope, format: ColorFormat) {
  const selectEl = dom.getFormatSelectEl(scope)
  if (!selectEl) return
  frame.request(() => setElementValue(selectEl, format))
}

// Show the focus ring when closed from the keyboard; leave it to the browser otherwise
function getReturnFocusOptions(event: Record<string, any>): FocusOptions {
  const focusVisible = event.focusVisible ?? event.previousEvent?.focusVisible
  return focusVisible ? { preventScroll: true, focusVisible: true } : { preventScroll: true }
}

function editColor(
  { context, computed }: Pick<Params<ColorPickerSchema>, "context" | "computed">,
  format: ColorFormat | undefined,
  edit: (color: Color) => Color,
) {
  const color = format ? context.get("value").toFormat(format) : computed("areaValue")
  const next = edit(color)
  context.set("editedColor", next)
  context.set("value", next.toFormat(context.get("format")))
}
