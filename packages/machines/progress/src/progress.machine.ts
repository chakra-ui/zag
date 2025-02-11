import { isNumber } from "@zag-js/utils"
import { createMachine } from "@zag-js/core"
import type { ProgressSchema } from "./progress.types"

function midValue(min: number, max: number) {
  return min + (max - min) / 2
}

export const machine = createMachine<ProgressSchema>({
  props({ props }) {
    const min = props.min ?? 0
    const max = props.max ?? 100
    return {
      ...props,
      max,
      min,
      defaultValue: props.defaultValue ?? midValue(min, max),
      orientation: "horizontal",
      translations: {
        value: ({ percent }) => (percent === -1 ? "loading..." : `${percent} percent`),
        ...props.translations,
      },
    }
  },

  initialState() {
    return "idle"
  },

  context({ bindable, prop }) {
    return {
      value: bindable<number | null>(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        onChange(value) {
          prop("onValueChange")?.({ value })
        },
      })),
    }
  },

  computed: {
    isIndeterminate: ({ context }) => context.get("value") === null,
    percent({ context, prop }) {
      const value = context.get("value")
      if (!isNumber(value)) return -1
      return Math.round(((value - prop("min")) / (prop("max") - prop("min"))) * 100)
    },
    isAtMax: ({ context, prop }) => context.get("value") === prop("max"),
    isHorizontal: ({ prop }) => prop("orientation") === "horizontal",
    isRtl: ({ prop }) => prop("dir") === "rtl",
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

  implementations: {
    actions: {
      setValue: ({ context, event, prop }) => {
        const value = event.value === null ? null : Math.max(0, Math.min(event.value, prop("max")))
        context.set("value", value)
      },
      validateContext: ({ context, prop }) => {
        const max = prop("max")
        const min = prop("min")

        const value = context.get("value")
        if (value == null) return

        if (!isValidNumber(max)) {
          throw new Error(`[progress] The max value passed \`${max}\` is not a valid number`)
        }

        if (!isValidMax(value, max)) {
          throw new Error(`[progress] The value passed \`${value}\` exceeds the max value \`${max}\``)
        }

        if (!isValidMin(value, min)) {
          throw new Error(`[progress] The value passed \`${value}\` exceeds the min value \`${min}\``)
        }
      },
    },
  },
})

function isValidNumber(max: any) {
  return isNumber(max) && !isNaN(max)
}

function isValidMax(value: number, max: number) {
  return isValidNumber(value) && value <= max
}

function isValidMin(value: number, min: number) {
  return isValidNumber(value) && value >= min
}
