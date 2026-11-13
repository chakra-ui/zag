import { createMachine, memo } from "@zag-js/core"
import type { ProgressSchema } from "./progress.types"
import { getClampedValue, getPercent, isFiniteNumber } from "./progress.utils"

export const machine = createMachine<ProgressSchema>({
  props({ props }) {
    const min = props.min ?? 0
    const max = props.max ?? 100
    return {
      orientation: "horizontal",
      ...props,
      max,
      min,
      defaultValue: props.defaultValue !== undefined ? props.defaultValue : min,
      formatOptions: {
        style: "percent",
        ...props.formatOptions,
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
    isIndeterminate: ({ context }) => !isFiniteNumber(context.get("value")),
    clampedValue: ({ context, prop }) => getClampedValue(context.get("value"), prop("min"), prop("max")),
    percent: ({ computed, prop }) => getPercent(computed("clampedValue"), prop("min"), prop("max")),
    formatter: memo(
      ({ prop }) => [prop("locale"), prop("formatOptions")],
      ([locale, formatOptions]) => new Intl.NumberFormat(locale, formatOptions),
    ),
    percentFormatter: memo(
      ({ prop }) => [prop("locale"), prop("formatOptions")],
      ([locale, formatOptions]) =>
        new Intl.NumberFormat(locale, formatOptions.style === "percent" ? formatOptions : { style: "percent" }),
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
        const value = getClampedValue(event.value, prop("min"), prop("max"))
        context.set("value", value)
      },
    },
  },
})
