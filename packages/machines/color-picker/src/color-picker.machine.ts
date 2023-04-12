import { parseColor } from "@zag-js/color-utils"
import { createMachine } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import { dom } from "./color-picker.dom"
import { MachineContext, MachineState, UserDefinedContext } from "./color-picker.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)

  const value = ctx.value || "#D9D9D9"
  const valueAsColor = parseColor(value)

  return createMachine<MachineContext, MachineState>(
    {
      id: "color-picker",
      initial: "idle",
      context: {
        format: "hex",
        value,
        valueAsColor,
        ...ctx,
      },

      computed: {},

      watch: {
        value: ["setValueAsColor"],
      },

      states: {
        idle: {
          on: {
            "EYEDROP.CLICK": {
              actions: ["openEyeDropper"],
            },
            "AREA.POINTER_DOWN": {
              actions: ["setActiveThumb", "setColorFromPoint"],
            },
          },
        },

        focused: {
          on: {
            "AREA.POINTER_DOWN": {
              target: "dragging",
              actions: ["setActiveThumb"],
            },
            "SLIDER.POINTER_DOWN": {
              target: "dragging",
              actions: ["setActiveThumb"],
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
          activities: ["trackPointerMove"],
          on: {
            "AREA.POINTER_MOVE": {},
            "AREA.POINTER_UP": {},
          },
        },
      },
    },
    {
      guards: {},
      actions: {
        openEyeDrop(ctx) {
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
        setColorFromPoint() {},
        incrementXChannel() {},
        decrementXChannel() {},
        incrementYChannel() {},
        decrementYChannel() {},
        setValue(ctx, evt) {
          ctx.value = evt.value
        },
      },
    },
  )
}
