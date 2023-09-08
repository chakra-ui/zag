import { parseColor, type Color } from "@zag-js/color-utils"
import { createMachine } from "@zag-js/core"
import { trackPointerMove } from "@zag-js/dom-event"
import { raf } from "@zag-js/dom-query"
import { trackFormControl } from "@zag-js/form-utils"
import { clampValue, getPercentValue, snapValueToStep } from "@zag-js/numeric-range"
import { disableTextSelection } from "@zag-js/text-selection"
import { compact } from "@zag-js/utils"
import { dom } from "./color-picker.dom"
import type { ExtendedColorChannel, MachineContext, MachineState, UserDefinedContext } from "./color-picker.types"
import { getChannelDetails } from "./utils/get-channel-details"
import { getChannelInputValue } from "./utils/get-channel-input-value"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "color-picker",
      initial: "idle",
      context: {
        dir: "ltr",
        value: "#D9D9D9",
        disabled: false,
        ...ctx,
        activeId: null,
        activeChannel: null,
        activeOrientation: null,
        fieldsetDisabled: false,
      },

      computed: {
        isRtl: (ctx) => ctx.dir === "rtl",
        isDisabled: (ctx) => !!ctx.disabled || ctx.fieldsetDisabled,
        isInteractive: (ctx) => !(ctx.isDisabled || ctx.readOnly),
        valueAsColor: (ctx) => parseColor(ctx.value),
      },

      on: {
        "VALUE.SET": {
          actions: ["setValue"],
        },
      },

      activities: ["trackFormControl"],

      watch: {
        value: ["syncInputElements"],
      },

      states: {
        idle: {
          on: {
            "EYEDROPPER.CLICK": {
              actions: ["openEyeDropper"],
            },
            "AREA.POINTER_DOWN": {
              target: "dragging",
              actions: ["setActiveChannel", "setAreaColorFromPoint", "focusAreaThumb"],
            },
            "AREA.FOCUS": {
              target: "focused",
              actions: ["setActiveChannel"],
            },
            "CHANNEL_SLIDER.POINTER_DOWN": {
              target: "dragging",
              actions: ["setActiveChannel", "setChannelColorFromPoint", "focusChannelThumb"],
            },
            "CHANNEL_SLIDER.FOCUS": {
              target: "focused",
              actions: ["setActiveChannel"],
            },
            "CHANNEL_INPUT.FOCUS": {
              target: "focused",
              actions: ["setActiveChannel"],
            },
            "CHANNEL_INPUT.CHANGE": {
              actions: ["setChannelColorFromInput"],
            },
          },
        },

        focused: {
          on: {
            "AREA.POINTER_DOWN": {
              target: "dragging",
              actions: ["setActiveChannel", "setAreaColorFromPoint", "focusAreaThumb"],
            },
            "CHANNEL_SLIDER.POINTER_DOWN": {
              target: "dragging",
              actions: ["setActiveChannel", "setChannelColorFromPoint", "focusChannelThumb"],
            },
            "AREA.ARROW_LEFT": {
              actions: ["decrementXChannel"],
            },
            "AREA.ARROW_RIGHT": {
              actions: ["incrementXChannel"],
            },
            "AREA.ARROW_UP": {
              actions: ["incrementYChannel"],
            },
            "AREA.ARROW_DOWN": {
              actions: ["decrementYChannel"],
            },
            "AREA.PAGE_UP": {
              actions: ["incrementXChannel"],
            },
            "AREA.PAGE_DOWN": {
              actions: ["decrementXChannel"],
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
            "CHANNEL_INPUT.FOCUS": {
              actions: ["setActiveChannel"],
            },
            "CHANNEL_INPUT.CHANGE": {
              actions: ["setChannelColorFromInput"],
            },
            "CHANNEL_INPUT.BLUR": [
              {
                guard: "isTextField",
                target: "idle",
                actions: ["setChannelColorFromInput"],
              },
              { target: "idle" },
            ],
            "CHANNEL_SLIDER.BLUR": {
              target: "idle",
            },
            "AREA.BLUR": {
              target: "idle",
            },
          },
        },

        dragging: {
          exit: ["clearActiveChannel"],
          activities: ["trackPointerMove", "disableTextSelection"],
          on: {
            "AREA.POINTER_MOVE": {
              actions: ["setAreaColorFromPoint"],
            },
            "AREA.POINTER_UP": {
              target: "focused",
              actions: ["invokeOnChangeEnd"],
            },
            "CHANNEL_SLIDER.POINTER_MOVE": {
              actions: ["setChannelColorFromPoint"],
            },
            "CHANNEL_SLIDER.POINTER_UP": {
              target: "focused",
              actions: ["invokeOnChangeEnd"],
            },
          },
        },
      },
    },
    {
      guards: {
        isTextField: (_ctx, evt) => !!evt.isTextField,
      },
      activities: {
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
        trackPointerMove(ctx, _evt, { send }) {
          return trackPointerMove(dom.getDoc(ctx), {
            onPointerMove({ point }) {
              const type = ctx.activeId === "area" ? "AREA.POINTER_MOVE" : "CHANNEL_SLIDER.POINTER_MOVE"
              send({ type, point })
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
          const win = dom.getWin(ctx) as any
          const picker = new win.EyeDropper()
          picker
            .open()
            .then(({ sRGBHex }: { sRGBHex: string }) => {
              const format = ctx.valueAsColor.getColorSpace()
              const color = parseColor(sRGBHex).toFormat(format)
              set.value(ctx, color)
              ctx.onChangeEnd?.({ value: ctx.value, valueAsColor: color })
            })
            .catch(() => void 0)
        },
        setActiveChannel(ctx, evt) {
          ctx.activeId = evt.id
          if (evt.channel) {
            ctx.activeChannel = evt.channel
          }
          if (evt.orientation) {
            ctx.activeOrientation = evt.orientation
          }
        },
        clearActiveChannel(ctx) {
          ctx.activeChannel = null
          ctx.activeId = null
          ctx.activeOrientation = null
        },
        setAreaColorFromPoint(ctx, evt) {
          const { xChannel, yChannel } = evt.channel || ctx.activeChannel

          const percent = dom.getAreaValueFromPoint(ctx, evt.point)
          if (!percent) return

          const { getColorFromPoint } = getChannelDetails(ctx.valueAsColor, xChannel, yChannel)
          const color = getColorFromPoint(percent.x, percent.y)

          if (!color) return
          set.value(ctx, color)
        },
        setChannelColorFromPoint(ctx, evt) {
          const channel = evt.channel || ctx.activeId

          const percent = dom.getChannelSliderValueFromPoint(ctx, evt.point, channel)
          if (!percent) return

          const { minValue, maxValue, step } = ctx.valueAsColor.getChannelRange(channel)
          const orientation = ctx.activeOrientation || "horizontal"

          const point = orientation === "horizontal" ? percent.x : percent.y
          const channelValue = getPercentValue(point, minValue, maxValue, step)

          const value = snapValueToStep(channelValue - step, minValue, maxValue, step)
          const newColor = ctx.valueAsColor.withChannelValue(channel, value)

          set.value(ctx, newColor)
        },
        setValue(ctx, evt) {
          set.value(ctx, evt.value)
        },
        syncInputElements(ctx) {
          // sync channel inputs
          const inputs = dom.getChannelInputEls(ctx)
          inputs.forEach((input) => {
            const channel = input.dataset.channel as ExtendedColorChannel | null
            dom.setValue(input, getChannelInputValue(ctx.valueAsColor, channel))
          })

          // sync hidden input
          dom.setValue(dom.getHiddenInputEl(ctx), ctx.value)
        },
        invokeOnChangeEnd(ctx) {
          invoke.changeEnd(ctx)
        },
        setChannelColorFromInput(ctx, evt) {
          const { channel, isTextField, value } = evt
          try {
            const format = ctx.valueAsColor.getColorSpace()

            const newColor = isTextField
              ? parseColor(value).toFormat(format)
              : ctx.valueAsColor.withChannelValue(channel, value)

            set.value(ctx, newColor)
            //
          } catch {
            // reset input value
            const inputEl = dom.getChannelInputEl(ctx, channel)
            dom.setValue(inputEl, getChannelInputValue(ctx.valueAsColor, channel))
          }
        },

        incrementChannel(ctx, evt) {
          const { minValue, maxValue, step } = ctx.valueAsColor.getChannelRange(evt.channel)
          const channelValue = ctx.valueAsColor.getChannelValue(evt.channel)
          const value = snapValueToStep(channelValue + evt.step, minValue, maxValue, step)
          const color = ctx.valueAsColor.withChannelValue(evt.channel, clampValue(value, minValue, maxValue))
          set.value(ctx, color)
        },
        decrementChannel(ctx, evt) {
          const { minValue, maxValue, step } = ctx.valueAsColor.getChannelRange(evt.channel)
          const channelValue = ctx.valueAsColor.getChannelValue(evt.channel)
          const value = snapValueToStep(channelValue - evt.step, minValue, maxValue, step)
          const color = ctx.valueAsColor.withChannelValue(evt.channel, clampValue(value, minValue, maxValue))
          set.value(ctx, color)
        },

        incrementXChannel(ctx, evt) {
          const { xChannel, yChannel } = evt.channel
          const { incrementX } = getChannelDetails(ctx.valueAsColor, xChannel, yChannel)
          const color = ctx.valueAsColor.withChannelValue(xChannel, incrementX(evt.step))
          set.value(ctx, color)
        },
        decrementXChannel(ctx, evt) {
          const { xChannel, yChannel } = evt.channel
          const { decrementX } = getChannelDetails(ctx.valueAsColor, xChannel, yChannel)
          const color = ctx.valueAsColor.withChannelValue(xChannel, decrementX(evt.step))
          set.value(ctx, color)
        },

        incrementYChannel(ctx, evt) {
          const { xChannel, yChannel } = evt.channel
          const { incrementY } = getChannelDetails(ctx.valueAsColor, xChannel, yChannel)
          const color = ctx.valueAsColor.withChannelValue(yChannel, incrementY(evt.step))
          set.value(ctx, color)
        },
        decrementYChannel(ctx, evt) {
          const { xChannel, yChannel } = evt.channel
          const { decrementY } = getChannelDetails(ctx.valueAsColor, xChannel, yChannel)
          const color = ctx.valueAsColor.withChannelValue(yChannel, decrementY(evt.step))
          set.value(ctx, color)
        },

        setChannelToMax(ctx, evt) {
          const { maxValue } = ctx.valueAsColor.getChannelRange(evt.channel)
          const color = ctx.valueAsColor.withChannelValue(evt.channel, maxValue)
          set.value(ctx, color)
        },
        setChannelToMin(ctx, evt) {
          const { minValue } = ctx.valueAsColor.getChannelRange(evt.channel)
          const color = ctx.valueAsColor.withChannelValue(evt.channel, minValue)
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
      },
    },
  )
}

const getDetails = (ctx: MachineContext) => ({
  value: ctx.value,
  valueAsColor: ctx.valueAsColor,
})

const invoke = {
  changeEnd(ctx: MachineContext) {
    ctx.onChangeEnd?.(getDetails(ctx))
  },
  change(ctx: MachineContext) {
    ctx.onChange?.(getDetails(ctx))
  },
}

const set = {
  value(ctx: MachineContext, color: Color) {
    if (ctx.valueAsColor.isEqual(color)) return
    ctx.value = color.toString("css")
    invoke.change(ctx)
  },
}
