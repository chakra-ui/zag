import { pinInputConnect } from "./pin-input.connect"
import { pinInputMachine } from "./pin-input.machine"

export const pinInput = {
  machine: pinInputMachine,
  connect: pinInputConnect,
}

export type { PinInputMachineContext, PinInputMachineState } from "./pin-input.machine"
