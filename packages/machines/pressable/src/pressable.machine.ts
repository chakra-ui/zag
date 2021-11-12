import { createMachine } from "@ui-machines/core"

export type PressableMachineState = {
  value: "hover" | "press:in" | "idle" | "long:press"
}

export const pressableMachine = createMachine<{}, PressableMachineState>({
  initial: "idle",
  states: {
    idle: {
      on: {
        POINTER_OVER: "hover",
      },
    },
    hover: {
      on: {
        POINTER_LEAVE: "idle",
        POINTER_DOWN: "press:in",
      },
    },
    "press:in": {
      after: {
        500: "long:press",
      },
      on: {
        POINTER_UP: "hover",
      },
    },
    "long:press": {
      on: {
        POINTER_UP: "hover",
        POINTER_LEAVE: "idle",
      },
    },
  },
})
