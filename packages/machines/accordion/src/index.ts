import { accordionConnect } from "./accordion.connect"
import { accordionMachine } from "./accordion.machine"

export const accordion = {
  machine: accordionMachine,
  connect: accordionConnect,
}

export type { AccordionMachineContext, AccordionMachineState } from "./accordion.types"
