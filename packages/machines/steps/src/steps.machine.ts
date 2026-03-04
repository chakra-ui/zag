import { createMachine, memo } from "@zag-js/core"
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
    percent: memo(
      ({ context, prop }) => [context.get("step"), prop("count")],
      ([step, count]) => (step / count) * 100,
    ),
    hasNextStep: ({ context, prop }) => context.get("step") < prop("count"),
    hasPrevStep: ({ context }) => context.get("step") > 0,
    completed: ({ context, prop }) => context.get("step") === prop("count"),
  },

  initialState() {
    return "idle"
  },

  entry: ["validateStepIndex"],

  states: {
    idle: {
      on: {
        "STEP.SET": [
          {
            guard: "isValidStepNavigation",
            actions: ["setStep"],
          },
          {
            actions: ["invokeOnStepInvalid"],
          },
        ],
        "STEP.NEXT": [
          {
            guard: "isCurrentStepValid",
            actions: ["goToNextStep"],
          },
          {
            actions: ["invokeOnStepInvalid"],
          },
        ],
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
    guards: {
      isCurrentStepValid({ context, prop }) {
        const current = context.get("step")
        // Skippable steps bypass validation
        if (prop("isStepSkippable")?.(current)) return true
        const isStepValid = prop("isStepValid")
        if (!isStepValid) return true
        return isStepValid(current)
      },
      isValidStepNavigation({ context, event, prop }) {
        const current = context.get("step")
        // Always allow backward navigation
        if (event.value <= current) return true
        // Skippable steps bypass validation
        if (prop("isStepSkippable")?.(current)) return true
        // For forward navigation, validate current step
        const isStepValid = prop("isStepValid")
        if (!isStepValid) return true
        return isStepValid(current)
      },
    },

    actions: {
      goToNextStep({ context, prop }) {
        const count = prop("count")
        context.set("step", Math.min(context.get("step") + 1, count))
      },
      goToPrevStep({ context }) {
        context.set("step", Math.max(context.get("step") - 1, 0))
      },
      resetStep({ context }) {
        context.set("step", 0)
      },
      setStep({ context, event }) {
        context.set("step", event.value)
      },
      validateStepIndex({ context, prop }) {
        validateStepIndex(prop("count"), context.get("step"))
      },
      invokeOnStepInvalid({ context, event, prop }) {
        prop("onStepInvalid")?.({
          step: context.get("step"),
          action: event.type === "STEP.NEXT" ? "next" : "set",
          targetStep: event.value,
        })
      },
    },
  },
})

const validateStepIndex = (count: number, step: number) => {
  if (!isValueWithinRange(step, 0, count)) {
    throw new RangeError(`[zag-js/steps] step index ${step} is out of bounds`)
  }
}
