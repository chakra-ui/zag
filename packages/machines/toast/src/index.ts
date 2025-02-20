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
  ToastGroupProps as GroupProps,
  ToastGroupService as GroupService,
  Options,
  Placement,
  PromiseOptions,
  ToastProps as Props,
  ToastService as Service,
  Status,
  StatusChangeDetails,
  ToastStore,
  ToastStoreProps,
  Type,
} from "./toast.types"

export const group = {
  connect: groupConnect,
  machine: groupMachine,
}
