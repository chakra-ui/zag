import { Color, parseColor } from "@zag-js/color-utils"
import { createMachine } from "@zag-js/core"
import { trackPointerMove } from "@zag-js/dom-event"
import { getPercentValue } from "@zag-js/numeric-range"
import { compact } from "@zag-js/utils"
import { dom } from "./color-picker.dom"
import { MachineContext, MachineState, UserDefinedContext } from "./color-picker.types"
import { getChannelDetails } from "./color-picker.utils"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)

  return createMachine<MachineContext, MachineState>(
    {
      id: "color-picker",
      initial: "idle",
      context: {
        dir: "ltr",
        format: "hex",
        activeId: null,
        activeChannel: null,
        value: "#D9D9D9",
        ...ctx,
        valueAsColor: parseColor(ctx.value || "#D9D9D9"),
      },

      computed: {
        isRtl: (ctx) => ctx.dir === "rtl",
        displayColor: (ctx) => ctx.valueAsColor.withChannelValue("alpha", 1),
      },

      states: {
        idle: {
          on: {
            "EYEDROP.CLICK": {
              actions: ["openEyeDropperper"],
            },
            "AREA.POINTER_DOWN": {
              target: "dragging",
              actions: ["setActiveId", "setActiveChannel", "setAreaColorFromPoint"],
            },
            "SLIDER.POINTER_DOWN": {
              target: "dragging",
              actions: ["setActiveId", "setActiveChannel", "setChannelColorFromPoint"],
            },
          },
        },

        focused: {
          on: {
            "AREA.POINTER_DOWN": {
              target: "dragging",
              actions: ["setActiveId", "setActiveChannel", "setAreaColorFromPoint"],
            },
            "SLIDER.POINTER_DOWN": {
              target: "dragging",
              actions: ["setActiveId", "setActiveChannel", "setChannelColorFromPoint"],
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
          },
        },

        dragging: {
          exit: ["clearActiveChannel", "clearActiveId"],
          activities: ["trackPointerMove"],
          on: {
            "AREA.POINTER_MOVE": {
              actions: ["setAreaColorFromPoint"],
            },
            "AREA.POINTER_UP": {
              target: "focused",
            },
            "SLIDER.POINTER_MOVE": {
              actions: ["setChannelColorFromPoint"],
            },
            "SLIDER.POINTER_UP": {
              target: "focused",
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
          const picker = new (dom.getWin as any).EyeDropper()
          picker
            .open()
            .then(({ sRGBHex }: { sRGBHex: string }) => {
              const color = parseColor(sRGBHex).toFormat(ctx.format)
              setColor(ctx, color)
              ctx.onChangeEnd?.({ value: ctx.value, valueAsColor: color })
            })
            .catch(() => void 0)
        },
        setActiveId(ctx, evt) {
          ctx.activeId = evt.id
        },
        clearActiveId(ctx) {
          ctx.activeId = null
        },
        setActiveChannel(ctx, evt) {
          ctx.activeChannel = evt.channel
        },
        clearActiveChannel(ctx) {
          ctx.activeChannel = null
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
          const percent = dom.getSliderValueFromPoint(ctx, evt.point, channel)

          const { minValue, maxValue, step } = ctx.valueAsColor.getChannelRange(channel)
          const value = getPercentValue(percent.x, minValue, maxValue, step)

          const newColor = ctx.valueAsColor.withChannelValue(channel, value)

          setColor(ctx, newColor)
        },
        setValueAsColor(ctx) {
          ctx.valueAsColor = parseColor(ctx.value)
        },
        incrementXChannel() {},
        decrementXChannel() {},
        incrementYChannel() {},
        decrementYChannel() {},
        incrementAlphaChannel() {},
        decrementAlphaChannel() {},
        setValue(ctx, evt) {
          ctx.value = evt.value
        },
      },
    },
  )
}

const setColor = (ctx: MachineContext, color: Color) => {
  ctx.value = color.toString(ctx.format)
  ctx.valueAsColor = color
}
