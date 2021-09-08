import { editableConnect } from "./editable.connect"
import { editableMachine } from "./editable.machine"

export const editable = {
  machine: editableMachine,
  connect: editableConnect,
}

export type { EditableMachineContext, EditableMachineState } from "./editable.machine"
