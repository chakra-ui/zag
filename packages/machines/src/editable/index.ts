import { connectEditableMachine } from "./editable.connect"
import { editableMachine } from "./editable.machine"

export const editable = {
  machine: editableMachine,
  connect: connectEditableMachine,
}

export type {
  EditableMachineContext,
  EditableMachineState,
} from "./editable.machine"
