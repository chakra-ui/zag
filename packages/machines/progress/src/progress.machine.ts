import { createMachine, memo } from "@zag-js/core"
import { getValuePercent, isNumber } from "@zag-js/utils"
import type { ProgressSchema } from "./progress.types"

export const machine = createMachine<ProgressSchema>({
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
        value: ({ percent }) => (percent === -1 ? "loading..." : `${percent} percent`),
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
      return getValuePercent(value, prop("min"), prop("max")) * 100
    },
    formatter: memo(
      ({ prop }) => [prop("locale"), prop("formatOptions")],
      (locale, formatOptions) => new Intl.NumberFormat(locale, formatOptions),
    ),
    isHorizontal: ({ prop }) => prop("orientation") === "horizontal",
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

const isValidNumber = (max: any) => isNumber(max) && !isNaN(max)
const isValidMax = (value: number, max: number) => isValidNumber(value) && value <= max
const isValidMin = (value: number, min: number) => isValidNumber(value) && value >= min

const midValue = (min: number, max: number) => min + (max - min) / 2
