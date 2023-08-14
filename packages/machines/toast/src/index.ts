import { isDom } from "@zag-js/dom-query"
import { warn } from "@zag-js/utils"
import { groupConnect, toaster } from "./toast-group.connect"
import { groupMachine } from "./toast-group.machine"
import { createToastMachine as createMachine } from "./toast.machine"

export { anatomy } from "./toast.anatomy"
export { connect } from "./toast.connect"
export type {
  GroupMachineContext,
  MachineContext,
  MachineState,
  Placement,
  MachineApi as Api,
  GroupMachineApi as GroupApi,
  Service,
  ToastOptions,
  Type,
} from "./toast.types"
export { createMachine }

export const group = {
  connect: groupConnect,
  machine: groupMachine,
}

export function api() {
  if (!isDom()) {
    warn("toast.api() is only available in the browser")
  } else {
    return toaster
  }
}
