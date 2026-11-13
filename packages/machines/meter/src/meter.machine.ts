import { createMachine, memo } from "@zag-js/core"
import type { MeterSchema } from "./meter.types"
import { getClampedValue, getMeterValueState, getPercent, resolveMeterBounds, validateMeterBounds } from "./meter.utils"

export const machine = createMachine<MeterSchema>({
  props({ props }) {
    const min = props.min ?? 0
    const max = props.max ?? 100
    validateMeterBounds(min, max, props.low, props.high, props.optimum)
    const bounds = resolveMeterBounds(min, max, props.low, props.high, props.optimum)
    return {
      orientation: "horizontal",
      ...props,
      min: bounds.min,
      max: bounds.max,
      low: bounds.low,
      high: bounds.high,
      optimum: bounds.optimum,
      defaultValue: props.defaultValue ?? min,
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
    valueState: ({ computed, prop }) =>
      getMeterValueState(computed("clampedValue"), {
        min: prop("min"),
        max: prop("max"),
        low: prop("low"),
        high: prop("high"),
        optimum: prop("optimum"),
      }),
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
        context.set("value", getClampedValue(event.value, prop("min"), prop("max")))
      },
    },
  },
})
