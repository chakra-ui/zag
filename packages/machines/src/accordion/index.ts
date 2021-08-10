import { connectAccordionMachine } from "./accordion.connect"
import { accordionMachine } from "./accordion.machine"

export const accordion = {
  machine: accordionMachine,
  connect: connectAccordionMachine,
}

export type { AccordionMachineContext, AccordionMachineState } from "./accordion.machine"
