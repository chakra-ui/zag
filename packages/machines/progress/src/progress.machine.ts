import { createMachine } from "@zag-js/core"
import { compact, isNumber } from "@zag-js/utils"
import type { MachineContext, MachineState, UserDefinedContext } from "./progress.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "progress",
      initial: "idle",
      context: {
        value: 50,
        max: 100,
        min: 0,
        orientation: "horizontal",
        translations: {
          value: ({ percent }) => (percent === -1 ? "loading..." : `${percent} percent`),
          ...ctx.translations,
        },
        ...ctx,
      },
      created: ["validateContext"],
      computed: {
        isIndeterminate: (ctx) => ctx.value === null,
        percent(ctx) {
          if (!isNumber(ctx.value)) return -1
          return Math.round(((ctx.value - ctx.min) / (ctx.max - ctx.min)) * 100)
        },
        isAtMax: (ctx) => ctx.value === ctx.max,
        isHorizontal: (ctx) => ctx.orientation === "horizontal",
        isRtl: (ctx) => ctx.dir === "rtl",
      },
      states: {
        idle: {
          on: {
            "VALUE.SET": {
              actions: ["setValue"],
            },
          },
        },
      },
    },
    {
      guards: {},
      actions: {
        setValue: (ctx, evt) => {
          ctx.value = evt.value === null ? null : Math.max(0, Math.min(evt.value, ctx.max))
        },
        validateContext: (ctx) => {
          if (!isValidMaxNumber(ctx.max)) {
            throw new Error(`[Progress] Invalid max value: ${ctx.max}`)
          }
          if (!isValidValueNumber(ctx.value, ctx.max)) {
            throw new Error(`[Progress] Invalid value: ${ctx.value}`)
          }
        },
      },
    },
  )
}

function isValidMaxNumber(max: any): max is number {
  return isNumber(max) && !isNaN(max) && max > 0
}

function isValidValueNumber(value: any, max: number): value is number {
  return isNumber(value) && !isNaN(value) && value <= max && value >= 0
}
