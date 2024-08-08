import { createMachine } from "@zag-js/core"
import { compact, isEqual } from "@zag-js/utils"
import type { MachineContext, MachineState, UserDefinedContext } from "./steps.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "steps",
      initial: "idle",

      context: {
        step: 0,
        count: 1,
        linear: false,
        orientation: "horizontal",
        ...ctx,
      },

      computed: {
        percent: (ctx) => (ctx.step / ctx.count) * 100,
        hasNextStep: (ctx) => ctx.step < ctx.count,
        hasPrevStep: (ctx) => ctx.step > 0,
      },

      states: {
        idle: {
          on: {
            "STEP.SET": {
              actions: "setStep",
            },
            "STEP.NEXT": {
              actions: "goToNextStep",
            },
            "STEP.PREV": {
              actions: "goToPrevStep",
            },
            "STEP.RESET": {
              actions: "resetStep",
            },
          },
        },
      },
    },
    {
      actions: {
        goToNextStep(ctx) {
          const value = Math.min(ctx.step + 1, ctx.count)
          set.value(ctx, value)
        },
        goToPrevStep(ctx) {
          const value = Math.max(ctx.step - 1, 0)
          set.value(ctx, value)
        },
        resetStep(ctx) {
          set.value(ctx, 0)
        },
        setStep(ctx, event) {
          const value = event.value
          const inRange = value >= 0 && value < ctx.count
          if (!inRange) throw new RangeError(`Index ${value} is out of bounds`)
          set.value(ctx, value)
        },
      },
    },
  )
}

const set = {
  value(ctx: MachineContext, step: number) {
    if (isEqual(ctx.step, step)) return
    ctx.step = step
    ctx.onStepChange?.({ step })
  },
}
