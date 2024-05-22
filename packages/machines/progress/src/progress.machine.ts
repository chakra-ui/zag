import { createMachine } from "@zag-js/core"
import { compact, isNumber } from "@zag-js/utils"
import type { MachineContext, MachineState, UserDefinedContext } from "./progress.types"

function midValue(min: number, max: number) {
  return min + (max - min) / 2
}

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "progress",
      initial: "idle",
      context: {
        max: ctx.max ?? 100,
        min: ctx.min ?? 0,
        value: midValue(ctx.min ?? 0, ctx.max ?? 100),
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
      actions: {
        setValue: (ctx, evt) => {
          ctx.value = evt.value === null ? null : Math.max(0, Math.min(evt.value, ctx.max))
        },
        validateContext: (ctx) => {
          if (ctx.value == null) return

          if (!isValidNumber(ctx.max)) {
            throw new Error(`[progress] The max value passed \`${ctx.max}\` is not a valid number`)
          }

          if (!isValidMax(ctx.value, ctx.max)) {
            throw new Error(`[progress] The value passed \`${ctx.value}\` exceeds the max value \`${ctx.max}\``)
          }

          if (!isValidMin(ctx.value, ctx.min)) {
            throw new Error(`[progress] The value passed \`${ctx.value}\` exceeds the min value \`${ctx.min}\``)
          }
        },
      },
    },
  )
}

function isValidNumber(max: any) {
  return isNumber(max) && !isNaN(max)
}

function isValidMax(value: number, max: number) {
  return isValidNumber(value) && value <= max
}

function isValidMin(value: number, min: number) {
  return isValidNumber(value) && value >= min
}
