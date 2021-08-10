import { connectComboboxMachine } from "./combobox.connect"
import { comboboxMachine } from "./combobox.machine"

export const combobox = {
  machine: comboboxMachine,
  connect: connectComboboxMachine,
}

export type { ComboboxMachineContext, ComboboxMachineState } from "./combobox.machine"
