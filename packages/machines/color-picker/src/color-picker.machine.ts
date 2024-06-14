import { parseColor, type Color } from "@zag-js/color-utils"
import { createMachine, guards } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { trackPointerMove } from "@zag-js/dom-event"
import { getInitialFocus, raf } from "@zag-js/dom-query"
import { dispatchInputValueEvent, trackFormControl } from "@zag-js/form-utils"
import { getPlacement } from "@zag-js/popper"
import { disableTextSelection } from "@zag-js/text-selection"
import { compact, tryCatch } from "@zag-js/utils"
import { dom } from "./color-picker.dom"
import { parse } from "./color-picker.parse"
import type {
  ColorFormat,
  ColorType,
  ExtendedColorChannel,
  MachineContext,
  MachineState,
  UserDefinedContext,
} from "./color-picker.types"
import { getChannelValue } from "./utils/get-channel-input-value"

const { and } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "color-picker",
      initial: ctx.open ? "open" : "idle",
      context: {
        dir: "ltr",
        value: parse("#000000"),
        format: "rgba",
        disabled: false,
        closeOnSelect: false,
        ...ctx,
        activeId: null,
        activeChannel: null,
        activeOrientation: null,
        fieldsetDisabled: false,
        restoreFocus: true,
        positioning: {
          ...ctx.positioning,
          placement: "bottom",
        },
      },

      computed: {
        isRtl: (ctx) => ctx.dir === "rtl",
        isDisabled: (ctx) => !!ctx.disabled || ctx.fieldsetDisabled,
        isInteractive: (ctx) => !(ctx.isDisabled || ctx.readOnly),
        valueAsString: (ctx) => ctx.value.toString(ctx.format),
        areaValue: (ctx) => {
          const format = ctx.format.startsWith("hsl") ? "hsla" : "hsba"
          return ctx.value.toFormat(format)
        },
      },

      activities: ["trackFormControl"],

      watch: {
        value: ["syncInputElements"],
        format: ["syncFormatSelectElement"],
        open: ["toggleVisibility"],
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
          activities: ["trackPositioning", "trackDismissableElement"],
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
          activities: ["trackPointerMove", "disableTextSelection", "trackPositioning", "trackDismissableElement"],
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
    },
    {
      guards: {
        closeOnSelect: (ctx) => !!ctx.closeOnSelect,
        isOpenControlled: (ctx) => !!ctx["open.controlled"],
        shouldRestoreFocus: (ctx) => !!ctx.restoreFocus,
      },
      activities: {
        trackPositioning(ctx) {
          ctx.currentPlacement = ctx.positioning.placement
          const anchorEl = dom.getTriggerEl(ctx)
          const getPositionerEl = () => dom.getPositionerEl(ctx)
          return getPlacement(anchorEl, getPositionerEl, {
            ...ctx.positioning,
            defer: true,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
          })
        },
        trackDismissableElement(ctx, _evt, { send }) {
          const getContentEl = () => dom.getContentEl(ctx)
          return trackDismissableElement(getContentEl, {
            exclude: dom.getTriggerEl(ctx),
            defer: true,
            onInteractOutside(event) {
              ctx.onInteractOutside?.(event)
              if (event.defaultPrevented) return
              ctx.restoreFocus = !(event.detail.focusable || event.detail.contextmenu)
            },
            onPointerDownOutside: ctx.onPointerDownOutside,
            onFocusOutside: ctx.onFocusOutside,
            onDismiss() {
              send({ type: "INTERACT_OUTSIDE" })
            },
          })
        },
        trackFormControl(ctx, _evt, { send, initialContext }) {
          const inputEl = dom.getHiddenInputEl(ctx)
          return trackFormControl(inputEl, {
            onFieldsetDisabledChange(disabled) {
              ctx.fieldsetDisabled = disabled
            },
            onFormReset() {
              send({ type: "VALUE.SET", value: initialContext.value, src: "form.reset" })
            },
          })
        },
        trackPointerMove(ctx, evt, { send }) {
          return trackPointerMove(dom.getDoc(ctx), {
            onPointerMove({ point }) {
              const type = ctx.activeId === "area" ? "AREA.POINTER_MOVE" : "CHANNEL_SLIDER.POINTER_MOVE"
              send({ type, point, format: evt.format })
            },
            onPointerUp() {
              const type = ctx.activeId === "area" ? "AREA.POINTER_UP" : "CHANNEL_SLIDER.POINTER_UP"
              send({ type })
            },
          })
        },
        disableTextSelection(ctx) {
          return disableTextSelection({ doc: dom.getDoc(ctx), target: dom.getContentEl(ctx) })
        },
      },
      actions: {
        openEyeDropper(ctx) {
          const isSupported = "EyeDropper" in dom.getWin(ctx)
          if (!isSupported) return
          const win = dom.getWin(ctx)
          const picker = new win.EyeDropper()
          picker
            .open()
            .then(({ sRGBHex }) => {
              const format = ctx.value.getFormat()
              const color = parseColor(sRGBHex).toFormat(format) as Color
              set.value(ctx, color)
              ctx.onValueChangeEnd?.({ value: ctx.value, valueAsString: ctx.valueAsString })
            })
            .catch(() => void 0)
        },
        setActiveChannel(ctx, evt) {
          ctx.activeId = evt.id
          if (evt.channel) ctx.activeChannel = evt.channel
          if (evt.orientation) ctx.activeOrientation = evt.orientation
        },
        clearActiveChannel(ctx) {
          ctx.activeChannel = null
          ctx.activeId = null
          ctx.activeOrientation = null
        },
        setAreaColorFromPoint(ctx, evt) {
          const normalizedValue = evt.format ? ctx.value.toFormat(evt.format) : ctx.areaValue
          const { xChannel, yChannel } = evt.channel || ctx.activeChannel

          const percent = dom.getAreaValueFromPoint(ctx, evt.point)
          if (!percent) return

          const xValue = normalizedValue.getChannelPercentValue(xChannel, percent.x)
          const yValue = normalizedValue.getChannelPercentValue(yChannel, 1 - percent.y)

          const color = normalizedValue.withChannelValue(xChannel, xValue).withChannelValue(yChannel, yValue)
          set.value(ctx, color)
        },
        setChannelColorFromPoint(ctx, evt) {
          const channel = evt.channel || ctx.activeId
          const normalizedValue = evt.format ? ctx.value.toFormat(evt.format) : ctx.areaValue

          const percent = dom.getChannelSliderValueFromPoint(ctx, evt.point, channel)
          if (!percent) return

          const orientation = ctx.activeOrientation || "horizontal"
          const channelPercent = orientation === "horizontal" ? percent.x : percent.y

          const value = normalizedValue.getChannelPercentValue(channel, channelPercent)
          const color = normalizedValue.withChannelValue(channel, value)
          set.value(ctx, color)
        },
        setValue(ctx, evt) {
          set.value(ctx, evt.value)
        },
        setFormat(ctx, evt) {
          set.format(ctx, evt.format)
        },
        syncInputElements(ctx) {
          sync.inputs(ctx)
        },
        invokeOnChangeEnd(ctx) {
          invoke.changeEnd(ctx)
        },
        setChannelColorFromInput(ctx, evt) {
          const { channel, isTextField, value } = evt
          const currentAlpha = ctx.value.getChannelValue("alpha")

          // handle other text channels
          let color: Color

          // handle alpha channel
          if (channel === "alpha") {
            //
            let valueAsNumber = parseFloat(value)
            valueAsNumber = Number.isNaN(valueAsNumber) ? currentAlpha : valueAsNumber
            color = ctx.value.withChannelValue("alpha", valueAsNumber)
            //
          } else if (isTextField) {
            //
            color = tryCatch(
              () => parse(value).withChannelValue("alpha", currentAlpha),
              () => ctx.value,
            )
            //
          } else {
            //
            const current = ctx.value.toFormat(ctx.format)
            const valueAsNumber = Number.isNaN(value) ? current.getChannelValue(channel) : value
            color = current.withChannelValue(channel, valueAsNumber)
            //
          }

          // sync channel input value immediately (in event user types native css color, we need to convert it to the current channel format)
          sync.inputs(ctx, color)

          // set new color
          set.value(ctx, color)
        },
        incrementChannel(ctx, evt) {
          const color = ctx.value.incrementChannel(evt.channel, evt.step)
          set.value(ctx, color)
        },
        decrementChannel(ctx, evt) {
          const color = ctx.value.decrementChannel(evt.channel, evt.step)
          set.value(ctx, color)
        },
        incrementAreaXChannel(ctx, evt) {
          const { xChannel } = evt.channel
          const color = ctx.areaValue.incrementChannel(xChannel, evt.step)
          set.value(ctx, color)
        },
        decrementAreaXChannel(ctx, evt) {
          const { xChannel } = evt.channel
          const color = ctx.areaValue.decrementChannel(xChannel, evt.step)
          set.value(ctx, color)
        },
        incrementAreaYChannel(ctx, evt) {
          const { yChannel } = evt.channel
          const color = ctx.areaValue.incrementChannel(yChannel, evt.step)
          set.value(ctx, color)
        },
        decrementAreaYChannel(ctx, evt) {
          const { yChannel } = evt.channel
          const color = ctx.areaValue.decrementChannel(yChannel, evt.step)
          set.value(ctx, color)
        },
        setChannelToMax(ctx, evt) {
          const range = ctx.value.getChannelRange(evt.channel)
          const color = ctx.value.withChannelValue(evt.channel, range.maxValue)
          set.value(ctx, color)
        },
        setChannelToMin(ctx, evt) {
          const range = ctx.value.getChannelRange(evt.channel)
          const color = ctx.value.withChannelValue(evt.channel, range.minValue)
          set.value(ctx, color)
        },
        focusAreaThumb(ctx) {
          raf(() => {
            dom.getAreaThumbEl(ctx)?.focus({ preventScroll: true })
          })
        },
        focusChannelThumb(ctx, evt) {
          raf(() => {
            dom.getChannelSliderThumbEl(ctx, evt.channel)?.focus({ preventScroll: true })
          })
        },
        setInitialFocus(ctx) {
          raf(() => {
            const element = getInitialFocus({
              root: dom.getContentEl(ctx),
              getInitialEl: ctx.initialFocusEl,
            })
            element?.focus({ preventScroll: true })
          })
        },
        setReturnFocus(ctx) {
          raf(() => {
            dom.getTriggerEl(ctx)?.focus({ preventScroll: true })
          })
        },
        syncFormatSelectElement(ctx) {
          sync.formatSelect(ctx)
        },
        invokeOnOpen(ctx) {
          ctx.onOpenChange?.({ open: true })
        },
        invokeOnClose(ctx) {
          ctx.onOpenChange?.({ open: false })
        },
        toggleVisibility(ctx, evt, { send }) {
          send({ type: ctx.open ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: evt })
        },
      },
      compareFns: {
        value: (a, b) => a.isEqual(b),
      },
    },
  )
}

const sync = {
  // sync channel inputs
  inputs(ctx: MachineContext, color?: Color) {
    const channelInputs = dom.getChannelInputEls(ctx)
    raf(() => {
      channelInputs.forEach((inputEl) => {
        const channel = inputEl.dataset.channel as ExtendedColorChannel | null
        dom.setValue(inputEl, getChannelValue(color || ctx.value, channel))
      })
    })
  },
  // sync format select
  formatSelect(ctx: MachineContext) {
    const selectEl = dom.getFormatSelectEl(ctx)
    raf(() => {
      dom.setValue(selectEl, ctx.format)
    })
  },
}

const invoke = {
  changeEnd(ctx: MachineContext) {
    const value = ctx.value.toFormat(ctx.format)
    ctx.onValueChangeEnd?.({
      value,
      valueAsString: ctx.valueAsString,
    })
  },
  change(ctx: MachineContext) {
    const value = ctx.value.toFormat(ctx.format)
    ctx.onValueChange?.({
      value,
      valueAsString: ctx.valueAsString,
    })

    dispatchInputValueEvent(dom.getHiddenInputEl(ctx), { value: ctx.valueAsString })
  },
  formatChange(ctx: MachineContext) {
    ctx.onFormatChange?.({ format: ctx.format })
  },
}

const set = {
  value(ctx: MachineContext, color: Color | ColorType | undefined) {
    if (!color || ctx.value.isEqual(color)) return
    ctx.value = color
    invoke.change(ctx)
  },
  format(ctx: MachineContext, format: ColorFormat) {
    if (ctx.format === format) return
    ctx.format = format
    invoke.formatChange(ctx)
  },
}
