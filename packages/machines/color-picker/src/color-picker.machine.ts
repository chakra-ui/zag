import { Color, parseColor } from "@zag-js/color-utils"
import { createMachine } from "@zag-js/core"
import { trackPointerMove } from "@zag-js/dom-event"
import { getPercentValue } from "@zag-js/numeric-range"
import { compact } from "@zag-js/utils"
import { dom } from "./color-picker.dom"
import { ExtendedColorChannel, MachineContext, MachineState, UserDefinedContext } from "./color-picker.types"
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
        activeId: null,
        activeChannel: null,
        activeChannelOrientation: null,
        value: "#D9D9D9",
        ...ctx,
        valueAsColor: parseColor(ctx.value || "#D9D9D9"),
      },

      computed: {
        isRtl: (ctx) => ctx.dir === "rtl",
        isInteractive: (ctx) => !(ctx.disabled || ctx.readOnly),
      },

      on: {
        "VALUE.SET": {
          actions: ["setValue"],
        },
      },

      watch: {
        value: ["setValueAsColor", "syncChannelInputs", "invokeOnChange"],
      },

      states: {
        idle: {
          on: {
            "EYEDROPPER.CLICK": {
              actions: ["openEyeDropper"],
            },
            "AREA.POINTER_DOWN": {
              target: "dragging",
              actions: ["setActiveChannel", "setAreaColorFromPoint"],
            },
            "SLIDER.POINTER_DOWN": {
              target: "dragging",
              actions: ["setActiveChannel", "setChannelColorFromPoint"],
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
              actions: ["setActiveChannel", "setAreaColorFromPoint"],
            },
            "SLIDER.POINTER_DOWN": {
              target: "dragging",
              actions: ["setActiveChannel", "setChannelColorFromPoint"],
            },
            "AREA.ARROW_LEFT": {
              actions: ["decrementXChannel"],
            },
            "AREA.ARROW_RIGHT": {
              actions: ["incrementXChannel"],
            },
            "AREA.ARROW_UP": {
              actions: ["decrementYChannel"],
            },
            "AREA.ARROW_DOWN": {
              actions: ["incrementYChannel"],
            },
            "AREA.PAGE_UP": {
              actions: ["incrementXChannel"],
            },
            "AREA.PAGE_DOWN": {
              actions: ["decrementXChannel"],
            },
            "CHANNEL_INPUT.FOCUS": {
              actions: ["setActiveChannel"],
            },
            "CHANNEL_INPUT.CHANGE": {
              actions: ["setChannelColorFromInput"],
            },
          },
        },

        dragging: {
          exit: ["clearActiveChannel"],
          activities: ["trackPointerMove"],
          on: {
            "AREA.POINTER_MOVE": {
              actions: ["setAreaColorFromPoint"],
            },
            "AREA.POINTER_UP": {
              target: "focused",
              actions: ["invokeOnChangeEnd"],
            },
            "SLIDER.POINTER_MOVE": {
              actions: ["setChannelColorFromPoint"],
            },
            "SLIDER.POINTER_UP": {
              target: "focused",
              actions: ["invokeOnChangeEnd"],
            },
          },
        },
      },
    },
    {
      guards: {},
      activities: {
        trackPointerMove(ctx, _evt, { send }) {
          return trackPointerMove(dom.getDoc(ctx), {
            onPointerMove({ point }) {
              const type = ctx.activeId === "area" ? "AREA.POINTER_MOVE" : "SLIDER.POINTER_MOVE"
              send({ type, point })
            },
            onPointerUp() {
              const type = ctx.activeId === "area" ? "AREA.POINTER_UP" : "SLIDER.POINTER_UP"
              send({ type })
            },
          })
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
              const color = parseColor(sRGBHex)
              setColor(ctx, color)
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
            ctx.activeChannelOrientation = evt.orientation
          }
        },
        clearActiveChannel(ctx) {
          ctx.activeChannel = null
          ctx.activeId = null
          ctx.activeChannelOrientation = null
        },
        setAreaColorFromPoint(ctx, evt) {
          const { xChannel, yChannel } = evt.channel || ctx.activeChannel

          const percent = dom.getAreaValueFromPoint(ctx, evt.point)
          const { getColorFromPoint } = getChannelDetails(ctx.valueAsColor, xChannel, yChannel)
          const color = getColorFromPoint(percent.x, percent.y)

          if (!color) return
          setColor(ctx, color)
        },
        setChannelColorFromPoint(ctx, evt) {
          const channel = evt.channel || ctx.activeId
          const percent = dom.getChannelSliderValueFromPoint(ctx, evt.point, channel)

          const { minValue, maxValue, step } = ctx.valueAsColor.getChannelRange(channel)
          const position = ctx.activeChannelOrientation || "horizontal"

          const point = position === "horizontal" ? percent.x : percent.y
          const value = getPercentValue(point, minValue, maxValue, step)

          const newColor = ctx.valueAsColor.withChannelValue(channel, value)
          setColor(ctx, newColor)
        },
        setValue(ctx, evt) {
          setColor(ctx, evt.value)
        },
        setValueAsColor(ctx) {
          try {
            const color = parseColor(ctx.value)
            if (color.isEqual(ctx.valueAsColor)) return
            ctx.valueAsColor = color
          } catch {}
        },
        syncChannelInputs(ctx) {
          const inputs = dom.getChannelInputEls(ctx)
          inputs.forEach((input) => {
            const channel = input.getAttribute("data-channel") as ExtendedColorChannel | null
            if (!channel) return
            const value = getChannelInputValue(ctx.valueAsColor, channel)
            input.value = value.toString()
          })
        },
        setChannelColorFromInput(ctx, evt) {
          try {
            const channel = evt.channel
            const newColor = evt.isTextField
              ? parseColor(evt.value)
              : ctx.valueAsColor.withChannelValue(channel, evt.value)
            setColor(ctx, newColor)
          } catch {}
        },
        incrementXChannel() {},
        decrementXChannel() {},
        incrementYChannel() {},
        decrementYChannel() {},
        incrementAlphaChannel() {},
        decrementAlphaChannel() {},
        invokeOnChangeEnd(ctx) {
          ctx.onChangeEnd?.({ value: ctx.value, valueAsColor: ctx.valueAsColor })
        },
        invokeOnChange(ctx) {
          ctx.onChange?.({ value: ctx.value, valueAsColor: ctx.valueAsColor })
        },
      },
    },
  )
}

const setColor = (ctx: MachineContext, color: Color) => {
  ctx.value = color.toString("css")
  ctx.valueAsColor = color
}
