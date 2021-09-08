import { comboboxConnect } from "./combobox.connect"
import { comboboxMachine } from "./combobox.machine"

export const combobox = {
  machine: comboboxMachine,
  connect: comboboxConnect,
}

export type { ComboboxMachineContext, ComboboxMachineState } from "./combobox.machine"
