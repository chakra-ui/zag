import { numberInputConnect } from "./number-input.connect"
import { numberInputMachine } from "./number-input.machine"

export const numberInput = {
  machine: numberInputMachine,
  connect: numberInputConnect,
}

export type { NumberInputMachineContext, NumberInputMachineState } from "./number-input.machine"
