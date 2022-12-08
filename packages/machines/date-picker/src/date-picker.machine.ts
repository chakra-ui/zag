import { createMachine, ref } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import { MachineContext, MachineState, UserDefinedContext } from "./date-picker.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "date-picker",
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
