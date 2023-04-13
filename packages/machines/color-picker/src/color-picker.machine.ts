import { parseColor } from "@zag-js/color-utils"
import { createMachine } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import { dom } from "./color-picker.dom"
import { MachineContext, MachineState, UserDefinedContext } from "./color-picker.types"
import { trackPointerMove } from "@zag-js/dom-event"
import { getChannelDetails } from "./color-picker.utils"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)

  const value = ctx.value || "#D9D9D9"
  const valueAsColor = parseColor(value)

  return createMachine<MachineContext, MachineState>(
    {
      id: "color-picker",
      initial: "idle",
      context: {
        dir: "ltr",
        format: "hex",
        value,
        activeChannel: null,
        activeThumbId: null,
        valueAsColor,
        ...ctx,
      },

      computed: {
        isRtl: (ctx) => ctx.dir === "rtl",
        displayColor: (ctx) => ctx.valueAsColor.withChannelValue("alpha", 1),
      },

      watch: {
        value: ["setValueAsColor"],
      },

      states: {
        idle: {
          on: {
            "EYEDROP.CLICK": {
              actions: ["openEyeDropperper"],
            },
            "AREA.POINTER_DOWN": {
              target: "dragging",
              actions: ["setActiveThumb", "setActiveChannel", "setColorFromPoint"],
            },
            "SLIDER.POINTER_DOWN": {
              target: "dragging",
              actions: ["setActiveThumb", "setColorFromPoint"],
            },
          },
        },

        focused: {
          on: {
            "AREA.POINTER_DOWN": {
              target: "dragging",
              actions: ["setActiveThumb", "setActiveChannel", "setColorFromPoint"],
            },
            "SLIDER.POINTER_DOWN": {
              target: "dragging",
              actions: ["setActiveThumb", "setColorFromPoint"],
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
          exit: ["clearActiveThumb", "clearActiveChannel"],
          activities: ["trackPointerMove"],
          on: {
            "AREA.POINTER_MOVE": {
              actions: ["setColorFromPoint"],
            },
            "AREA.POINTER_UP": {
              target: "focused",
              actions: ["focusAreaThumb"],
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
              send({ type: "AREA.POINTER_MOVE", point })
            },
            onPointerUp() {
              send("AREA.POINTER_UP")
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
              const valueString = color.toString(ctx.format)
              ctx.value = valueString
              ctx.onChangeEnd?.({ value: valueString, valueAsColor: color })
            })
            .catch(() => void 0)
        },
        setActiveThumb(ctx, evt) {
          ctx.activeThumbId = evt.id
        },
        clearActiveThumb(ctx) {
          ctx.activeThumbId = null
        },
        setActiveChannel(ctx, evt) {
          ctx.activeChannel = evt.channel
        },
        clearActiveChannel(ctx) {
          ctx.activeChannel = null
        },
        setColorFromPoint(ctx, evt) {
          const { xChannel, yChannel } = evt.channel || ctx.activeChannel

          const point = dom.getAreaValueFromPoint(ctx, evt.point)
          const { getColorFromPoint } = getChannelDetails(valueAsColor, xChannel, yChannel)

          const color = getColorFromPoint(point.x, point.y)
          if (!color) return
          ctx.value = color.toString("css")
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
