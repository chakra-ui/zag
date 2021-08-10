import { connectPinInputMachine } from "./pin-input.connect"
import { pinInputMachine } from "./pin-input.machine"

export const pinInput = {
  machine: pinInputMachine,
  connect: connectPinInputMachine,
}

export type {
  PinInputMachineContext,
  PinInputMachineState,
} from "./pin-input.machine"
