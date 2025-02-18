import { parseColor, type Color } from "@zag-js/color-utils"
import { createGuards, createMachine, type Scope } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import {
  disableTextSelection,
  dispatchInputValueEvent,
  getInitialFocus,
  raf,
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
import { getChannelValue } from "./utils/get-channel-input-value"

const { and } = createGuards<ColorPickerSchema>()

export const machine = createMachine<ColorPickerSchema>({
  props({ props }) {
    return {
      dir: "ltr",
      defaultValue: parse("#000000"),
      defaultFormat: "rgba",
      openAutoFocus: true,
      ...props,
      positioning: {
        placement: "bottom",
        ...props.positioning,
      },
    }
  },

  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen")
    return open ? "open" : "idle"
  },

  context({ prop, bindable, getContext, scope }) {
    return {
      value: bindable<Color>(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        isEqual(a, b) {
          return a.toString("css") === b?.toString("css")
        },
        hash(a) {
          return a.toString("css")
        },
        onChange(value) {
          const ctx = getContext()
          const valueAsString = value.toString(ctx.get("format"))
          prop("onValueChange")?.({ value, valueAsString })
          dispatchInputValueEvent(dom.getHiddenInputEl(scope), { value: valueAsString })
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
      const format = context.get("format").startsWith("hsl") ? "hsla" : "hsba"
      return context.get("value").toFormat(format)
    },
  },

  effects: ["trackFormControl"],

  watch({ prop, context, action, track }) {
    track([() => context.hash("value")], () => {
      action(["syncInputElements"])
    })

    track([() => context.get("format")], () => {
      action(["syncFormatSelectElement"])
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
      actions: ["setValue"],
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
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "idle",
            actions: ["invokeOnClose"],
          },
        ],
        "AREA.POINTER_DOWN": {
          target: "open:dragging",
          actions: ["setActiveChannel", "setAreaColorFromPoint", "focusAreaThumb"],
        },
        "AREA.FOCUS": {
          actions: ["setActiveChannel"],
        },
        "CHANNEL_SLIDER.POINTER_DOWN": {
          target: "open:dragging",
          actions: ["setActiveChannel", "setChannelColorFromPoint", "focusChannelThumb"],
        },
        "CHANNEL_SLIDER.FOCUS": {
          actions: ["setActiveChannel"],
        },
        "AREA.ARROW_LEFT": {
          actions: ["decrementAreaXChannel"],
        },
        "AREA.ARROW_RIGHT": {
          actions: ["incrementAreaXChannel"],
        },
        "AREA.ARROW_UP": {
          actions: ["incrementAreaYChannel"],
        },
        "AREA.ARROW_DOWN": {
          actions: ["decrementAreaYChannel"],
        },
        "AREA.PAGE_UP": {
          actions: ["incrementAreaXChannel"],
        },
        "AREA.PAGE_DOWN": {
          actions: ["decrementAreaXChannel"],
        },
        "CHANNEL_SLIDER.ARROW_LEFT": {
          actions: ["decrementChannel"],
        },
        "CHANNEL_SLIDER.ARROW_RIGHT": {
          actions: ["incrementChannel"],
        },
        "CHANNEL_SLIDER.ARROW_UP": {
          actions: ["incrementChannel"],
        },
        "CHANNEL_SLIDER.ARROW_DOWN": {
          actions: ["decrementChannel"],
        },
        "CHANNEL_SLIDER.PAGE_UP": {
          actions: ["incrementChannel"],
        },
        "CHANNEL_SLIDER.PAGE_DOWN": {
          actions: ["decrementChannel"],
        },
        "CHANNEL_SLIDER.HOME": {
          actions: ["setChannelToMin"],
        },
        "CHANNEL_SLIDER.END": {
          actions: ["setChannelToMax"],
        },
        "CHANNEL_INPUT.BLUR": {
          actions: ["setChannelColorFromInput"],
        },
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
        "SWATCH_TRIGGER.CLICK": [
          {
            guard: and("isOpenControlled", "closeOnSelect"),
            actions: ["setValue", "invokeOnClose"],
          },
          {
            guard: "closeOnSelect",
            target: "focused",
            actions: ["setValue", "invokeOnClose", "setReturnFocus"],
          },
          {
            actions: ["setValue"],
          },
        ],
      },
    },

    "open:dragging": {
      tags: ["open"],
      exit: ["clearActiveChannel"],
      effects: ["trackPointerMove", "disableTextSelection", "trackPositioning", "trackDismissableElement"],
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
        "AREA.POINTER_MOVE": {
          actions: ["setAreaColorFromPoint", "focusAreaThumb"],
        },
        "AREA.POINTER_UP": {
          target: "open",
          actions: ["invokeOnChangeEnd"],
        },
        "CHANNEL_SLIDER.POINTER_MOVE": {
          actions: ["setChannelColorFromPoint", "focusChannelThumb"],
        },
        "CHANNEL_SLIDER.POINTER_UP": {
          target: "open",
          actions: ["invokeOnChangeEnd"],
        },
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
    },
  },

  implementations: {
    guards: {
      closeOnSelect: ({ prop }) => !!prop("closeOnSelect"),
      isOpenControlled: ({ prop }) => prop("open") != null,
      shouldRestoreFocus: ({ context }) => !!context.get("restoreFocus"),
    },
    effects: {
      trackPositioning({ context, prop, scope }) {
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
        const getContentEl = () => dom.getContentEl(scope)
        return trackDismissableElement(getContentEl, {
          exclude: dom.getTriggerEl(scope),
          defer: true,
          onInteractOutside(event) {
            prop("onInteractOutside")?.(event)
            if (event.defaultPrevented) return
            context.set("restoreFocus", !(event.detail.focusable || event.detail.contextmenu))
          },
          onPointerDownOutside: prop("onPointerDownOutside"),
          onFocusOutside: prop("onFocusOutside"),
          onDismiss() {
            send({ type: "INTERACT_OUTSIDE" })
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
            send({ type, point, format: event.format })
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
      openEyeDropper({ scope, context }) {
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
      },
      setAreaColorFromPoint({ context, event, computed, scope }) {
        const v = event.format ? context.get("value").toFormat(event.format) : computed("areaValue")
        const { xChannel, yChannel } = event.channel || context.get("activeChannel")

        const percent = dom.getAreaValueFromPoint(scope, event.point)
        if (!percent) return

        const xValue = v.getChannelPercentValue(xChannel, percent.x)
        const yValue = v.getChannelPercentValue(yChannel, 1 - percent.y)

        const color = v.withChannelValue(xChannel, xValue).withChannelValue(yChannel, yValue)
        context.set("value", color)
      },
      setChannelColorFromPoint({ context, event, computed, scope }) {
        const channel = event.channel || context.get("activeId")
        const normalizedValue = event.format ? context.get("value").toFormat(event.format) : computed("areaValue")

        const percent = dom.getChannelSliderValueFromPoint(scope, event.point, channel)
        if (!percent) return

        const orientation = context.get("activeOrientation") || "horizontal"
        const channelPercent = orientation === "horizontal" ? percent.x : percent.y

        const value = normalizedValue.getChannelPercentValue(channel, channelPercent)
        const color = normalizedValue.withChannelValue(channel, value)
        context.set("value", color)
      },
      setValue({ context, event }) {
        context.set("value", event.value)
      },
      setFormat({ context, event }) {
        context.set("format", event.format)
      },
      syncInputElements({ context, scope }) {
        syncInputs(scope, context.get("value"))
      },
      invokeOnChangeEnd({ context, prop, computed }) {
        prop("onValueChangeEnd")?.({
          value: context.get("value"),
          valueAsString: computed("valueAsString"),
        })
      },
      setChannelColorFromInput({ context, event, scope }) {
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
            () => parse(value).withChannelValue("alpha", currentAlpha),
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
        syncInputs(scope, context.get("value"), color)

        // set new color
        context.set("value", color)
      },
      incrementChannel({ context, event }) {
        const color = context.get("value").incrementChannel(event.channel, event.step)
        context.set("value", color)
      },
      decrementChannel({ context, event }) {
        const color = context.get("value").decrementChannel(event.channel, event.step)
        context.set("value", color)
      },
      incrementAreaXChannel({ context, event, computed }) {
        const { xChannel } = event.channel
        const color = computed("areaValue").incrementChannel(xChannel, event.step)
        context.set("value", color)
      },
      decrementAreaXChannel({ context, event, computed }) {
        const { xChannel } = event.channel
        const color = computed("areaValue").decrementChannel(xChannel, event.step)
        context.set("value", color)
      },
      incrementAreaYChannel({ context, event, computed }) {
        const { yChannel } = event.channel
        const color = computed("areaValue").incrementChannel(yChannel, event.step)
        context.set("value", color)
      },
      decrementAreaYChannel({ context, event, computed }) {
        const { yChannel } = event.channel
        const color = computed("areaValue").decrementChannel(yChannel, event.step)
        context.set("value", color)
      },
      setChannelToMax({ context, event }) {
        const value = context.get("value")
        const range = value.getChannelRange(event.channel)
        const color = value.withChannelValue(event.channel, range.maxValue)
        context.set("value", color)
      },
      setChannelToMin({ context, event }) {
        const value = context.get("value")
        const range = value.getChannelRange(event.channel)
        const color = value.withChannelValue(event.channel, range.minValue)
        context.set("value", color)
      },
      focusAreaThumb({ scope }) {
        raf(() => {
          dom.getAreaThumbEl(scope)?.focus({ preventScroll: true })
        })
      },
      focusChannelThumb({ event, scope }) {
        raf(() => {
          dom.getChannelSliderThumbEl(scope, event.channel)?.focus({ preventScroll: true })
        })
      },
      setInitialFocus({ prop, scope }) {
        if (!prop("openAutoFocus")) return
        raf(() => {
          const element = getInitialFocus({
            root: dom.getContentEl(scope),
            getInitialEl: prop("initialFocusEl"),
          })
          element?.focus({ preventScroll: true })
        })
      },
      setReturnFocus({ scope }) {
        raf(() => {
          dom.getTriggerEl(scope)?.focus({ preventScroll: true })
        })
      },
      syncFormatSelectElement({ context, scope }) {
        syncFormatSelect(scope, context.get("format"))
      },
      invokeOnOpen({ prop }) {
        prop("onOpenChange")?.({ open: true })
      },
      invokeOnClose({ prop }) {
        prop("onOpenChange")?.({ open: false })
      },
      toggleVisibility({ prop, event, send }) {
        send({ type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: event })
      },
    },
  },
})

function syncInputs(scope: Scope, currentValue: Color, nextValue?: Color) {
  const channelInputEls = dom.getChannelInputEls(scope)
  raf(() => {
    channelInputEls.forEach((inputEl) => {
      const channel = inputEl.dataset.channel as ExtendedColorChannel | null
      setElementValue(inputEl, getChannelValue(nextValue || currentValue, channel))
    })
  })
}

function syncFormatSelect(scope: Scope, format: ColorFormat) {
  const selectEl = dom.getFormatSelectEl(scope)
  if (!selectEl) return
  raf(() => setElementValue(selectEl, format))
}
