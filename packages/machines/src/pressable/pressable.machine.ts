import { createMachine } from "@chakra-ui/machine"

export type PressableMachineState = {
  value: "hover" | "pressIn" | "idle" | "longPressIn" | "test"
}

export const pressableMachine = createMachine<{}, PressableMachineState>({
  initial: "idle",
  states: {
    idle: {
      on: {
        pointerover: "hover",
      },
    },
    hover: {
      on: {
        pointerleave: "idle",
        pointerdown: "pressIn",
      },
    },
    pressIn: {
      after: {
        500: "longPressIn",
      },
      on: {
        pointerup: "hover",
      },
    },
    longPressIn: {
      on: {
        pointerup: "hover",
        pointerleave: "idle",
      },
    },
  },
})
