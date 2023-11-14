import { groupConnect } from "./toast-group.connect"
import { groupMachine } from "./toast-group.machine"
import { createToastMachine as createMachine } from "./toast.machine"

export { anatomy } from "./toast.anatomy"
export { connect } from "./toast.connect"
export type {
  MachineApi as Api,
  GroupMachineApi as GroupApi,
  GroupMachineContext,
  GroupProps,
  GroupState,
  MachineContext,
  GenericOptions,
  DefaultGenericOptions,
  Placement,
  PromiseOptions,
  Service,
  ToastOptions,
  Type,
} from "./toast.types"
export { createMachine }

export const group = {
  connect: groupConnect,
  machine: groupMachine,
}
