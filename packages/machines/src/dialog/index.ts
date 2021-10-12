import { dialogConnect } from "./dialog.connect"
import { dialogMachine } from "./dialog.machine"

export const dialog = {
  connect: dialogConnect,
  machine: dialogMachine,
}

export type { DialogMachineContext, DialogMachineState } from "./dialog.machine"
