import { groupConnect } from "./toast-group.connect"
import { groupMachine } from "./toast-group.machine"

export { anatomy } from "./toast.anatomy"
export { connect } from "./toast.connect"
export { machine } from "./toast.machine"
export { createToastStore as createStore } from "./toast.store"
export type {
  ToastApi as Api,
  ToastMachine as Machine,
  ToastProps as Props,
  ToastService as Service,
  ToastGroupApi as GroupApi,
  ToastGroupMachine as GroupMachine,
  ToastGroupProps as GroupProps,
  ToastGroupService as GroupService,
  ToastStore as Store,
  ToastStoreProps as StoreProps,
  Options,
  ActionOptions,
  Placement,
  PromiseOptions,
  Status,
  StatusChangeDetails,
  Type,
  ToastHeight,
} from "./toast.types"

export const group = {
  connect: groupConnect,
  machine: groupMachine,
}
