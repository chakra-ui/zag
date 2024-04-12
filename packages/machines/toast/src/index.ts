import { groupConnect } from "./toast-group.connect"
import { groupMachine } from "./toast-group.machine"
import { createToastMachine as createMachine } from "./toast.machine"

export { anatomy } from "./toast.anatomy"
export { connect } from "./toast.connect"
export type {
  MachineApi as Api,
  GenericOptions,
  GroupMachineApi as GroupApi,
  GroupMachineContext,
  GroupProps,
  GroupService,
  GroupState,
  MachineContext,
  Placement,
  PromiseOptions,
  Service,
  StatusChangeDetails,
  Options,
  Status,
  Type,
} from "./toast.types"
export { createMachine }

export const group = {
  connect: groupConnect,
  machine: groupMachine,
}
