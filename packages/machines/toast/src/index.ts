import { groupConnect } from "./toast-group.connect"
import { groupMachine } from "./toast-group.machine"

export { anatomy } from "./toast.anatomy"
export { connect } from "./toast.connect"
export { machine } from "./toast.machine"
export { createToastStore as createStore } from "./toast.store"
export type {
  ActionOptions,
  ToastApi as Api,
  ToastGroupApi as GroupApi,
  ToastGroupMachine as GroupMachine,
  ToastGroupProps as GroupProps,
  ToastGroupService as GroupService,
  ToastMachine as Machine,
  Options,
  Placement,
  PromiseOptions,
  ToastProps as Props,
  ToastService as Service,
  Status,
  StatusChangeDetails,
  ToastStore as Store,
  ToastStoreProps as StoreProps,
  Type,
} from "./toast.types"

export const group = {
  connect: groupConnect,
  machine: groupMachine,
}
