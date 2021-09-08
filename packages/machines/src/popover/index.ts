import { popoverConnect } from "./popover.connect"
import { popoverMachine } from "./popover.machine"

export const popover = {
  machine: popoverMachine,
  connect: popoverConnect,
}

export type { PopoverMachineContext, PopoverMachineState } from "./popover.machine"
