import { createMachine, memo } from "@zag-js/core"
import { clampValue, getValuePercent, isNumber } from "@zag-js/utils"
import type { MeterSchema } from "./meter.types"
import { getMeterValueState, resolveMeterBounds, validateMeterBounds } from "./meter.utils"

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
      defaultValue: props.defaultValue !== undefined ? props.defaultValue : midValue(min, max),
      formatOptions: {
        style: "percent",
        ...props.formatOptions,
      },
    }
  },

  initialState() {
    return "idle"
  },

  entry: ["validateContext", "clampValue"],

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
      getMeterValueState(context.get("value"), {
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
        context.set("value", clampValue(event.value, prop("min"), prop("max")))
      },
      clampValue: ({ context, prop }) => {
        const value = context.get("value")
        if (!isNumber(value)) return
        const next = clampValue(value, prop("min"), prop("max"))
        if (next !== value) context.set("value", next)
      },
      validateContext: ({ prop }) => {
        validateMeterBounds(prop("min"), prop("max"), prop("low"), prop("high"), prop("optimum"))
      },
    },
  },
})

const midValue = (min: number, max: number) => min + (max - min) / 2
