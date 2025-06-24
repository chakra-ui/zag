import { createMachine } from "@zag-js/core"
import { isValueWithinRange } from "@zag-js/utils"
import type { StepsSchema } from "./steps.types"

export const machine = createMachine<StepsSchema>({
  props({ props }) {
    return {
      defaultStep: 0,
      count: 1,
      linear: false,
      orientation: "horizontal",
      ...props,
    }
  },

  context({ prop, bindable }) {
    return {
      step: bindable<number>(() => ({
        defaultValue: prop("defaultStep"),
        value: prop("step"),
        onChange(value) {
          prop("onStepChange")?.({ step: value })
          const completed = value == prop("count")
          if (completed) prop("onStepComplete")?.()
        },
      })),
    }
  },

  computed: {
    percent: ({ context, prop }) => (context.get("step") / prop("count")) * 100,
    hasNextStep: ({ context, prop }) => context.get("step") < prop("count"),
    hasPrevStep: ({ context }) => context.get("step") > 0,
    completed: ({ context, prop }) => context.get("step") === prop("count"),
  },

  initialState() {
    return "idle"
  },

  entry: ["validateStep"],

  states: {
    idle: {
      on: {
        "STEP.SET": {
          actions: ["setStep"],
        },
        "STEP.NEXT": {
          actions: ["goToNextStep"],
        },
        "STEP.PREV": {
          actions: ["goToPrevStep"],
        },
        "STEP.RESET": {
          actions: ["resetStep"],
        },
      },
    },
  },

  implementations: {
    actions: {
      goToNextStep({ context, prop }) {
        const value = Math.min(context.get("step") + 1, prop("count"))
        context.set("step", value)
      },
      goToPrevStep({ context }) {
        const value = Math.max(context.get("step") - 1, 0)
        context.set("step", value)
      },
      resetStep({ context }) {
        context.set("step", 0)
      },
      setStep({ context, event }) {
        context.set("step", event.value)
      },
      validateStep({ context, prop }) {
        validateStep(prop("count"), context.get("step"))
      },
    },
  },
})

const validateStep = (count: number, step: number) => {
  if (!isValueWithinRange(step, 0, count)) {
    throw new RangeError(`[zag-js/steps] step index ${step} is out of bounds`)
  }
}
