import { createMachine, ref } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import { MachineContext, MachineState, UserDefinedContext } from "./collapsible.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "collapsible",
      initial: "idle",
      context: {
        ...ctx,
      },
      states: {},
    },
    {
      guards: {},
      actions: {},
    },
  )
}
