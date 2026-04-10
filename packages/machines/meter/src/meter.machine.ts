import { createMachine, memo } from "@zag-js/core"
import { getValuePercent, isNumber } from "@zag-js/utils"
import type { MeterSchema, MeterState } from "./meter.types"

function getMeterState(
  value: number,
  min: number,
  max: number,
  low?: number,
  high?: number,
  optimum?: number,
): MeterState {
  if (optimum != null) {
    const isOptimumInRange = low != null && high != null && optimum >= low && optimum <= high
    if (isOptimumInRange) {
      if (low != null && value < low) return "low"
      if (high != null && value > high) return "high"
      return "optimal"
    }

    if (low != null && optimum < low) {
      if (value <= optimum) return "optimal"
      if (value <= low) return "normal"
      return "high"
    }

    if (high != null && optimum > high) {
      if (value >= optimum) return "optimal"
      if (value >= high) return "normal"
      return "low"
    }
  }

  // Fallbacks if only low/high are defined
  if (low != null && value < low) return "low"
  if (high != null && value > high) return "high"

  return "normal"
}

export const machine = createMachine<MeterSchema>({
  props({ props }) {
    const min = props.min ?? 0
    const max = props.max ?? 100
    return {
      orientation: "horizontal",
      ...props,
      max,
      min,
      defaultValue: props.defaultValue !== undefined ? props.defaultValue : midValue(min, max),
      formatOptions: {
        style: "percent",
        ...props.formatOptions,
      },
      translations: {
        value: ({ value, percent, formatter }) => {
          if (formatter) {
            const formatOptions = formatter.resolvedOptions()
            const num = formatOptions.style === "percent" ? percent / 100 : value
            return formatter.format(num)
          }
          return value.toString()
        },
        ...props.translations,
      },
    }
  },

  initialState() {
    return "idle"
  },

  entry: ["validateContext"],

  context({ bindable, prop }) {
    return {
      value: bindable<number>(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        onChange(value) {
          prop("onValueChange")?.({ value })
        },
      })),
    }
  },

  computed: {
    percent({ context, prop }) {
      const value = context.get("value")
      if (!isNumber(value)) return 0
      return getValuePercent(value, prop("min"), prop("max")) * 100
    },
    formatter: memo(
      ({ prop }) => [prop("locale"), prop("formatOptions")],
      ([locale, formatOptions]) => new Intl.NumberFormat(locale, formatOptions),
    ),
    isHorizontal: ({ prop }) => prop("orientation") === "horizontal",
    valueState: ({ context, prop }) =>
      getMeterState(context.get("value"), prop("min"), prop("max"), prop("low"), prop("high"), prop("optimum")),
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
        const value = Math.max(prop("min"), Math.min(event.value, prop("max")))
        context.set("value", value)
      },
      validateContext: ({ context, prop }) => {
        const max = prop("max")
        const min = prop("min")

        const value = context.get("value")
        if (value == null) return

        if (!isValidNumber(max)) {
          throw new Error(`[meter] The max value passed \`${max}\` is not a valid number`)
        }

        if (!isValidMax(value, max)) {
          throw new Error(`[meter] The value passed \`${value}\` exceeds the max value \`${max}\``)
        }

        if (!isValidMin(value, min)) {
          throw new Error(`[meter] The value passed \`${value}\` exceeds the min value \`${min}\``)
        }
      },
    },
  },
})

const isValidNumber = (max: any) => isNumber(max) && !isNaN(max)
const isValidMax = (value: number, max: number) => isValidNumber(value) && value <= max
const isValidMin = (value: number, min: number) => isValidNumber(value) && value >= min

const midValue = (min: number, max: number) => min + (max - min) / 2
