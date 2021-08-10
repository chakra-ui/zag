import { connectNumberInputMachine } from "./number-input.connect"
import { numberInputMachine } from "./number-input.machine"

export const numberInput = {
  machine: numberInputMachine,
  connect: connectNumberInputMachine,
}

export type { NumberInputMachineContext, NumberInputMachineState } from "./number-input.machine"
