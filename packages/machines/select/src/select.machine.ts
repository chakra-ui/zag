import { createMachine, ref } from "@zag-js/core"
import { MachineContext, MachineState, UserDefinedContext } from "./select.types"

export function machine(ctx: UserDefinedContext) {
  return createMachine<MachineContext, MachineState>(
    {
      id: "select",
      initial: "unknown",
      context: {
        ...ctx,
      },
      states: {
        unknown: {
          on: {
            SETUP: {
              actions: ["setupDocument"],
            },
          },
        },
      },
    },
    {
      guards: {},
      actions: {
        setupDocument(ctx) {},
      },
    },
  )
}
