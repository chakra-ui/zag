import { connectPopoverMachine } from "./popover.connect"
import { popoverMachine } from "./popover.machine"

export const popover = {
  machine: popoverMachine,
  connect: connectPopoverMachine,
}

export type { PopoverMachineContext, PopoverMachineState } from "./popover.machine"
