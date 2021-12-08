import { isDom, warn } from "@ui-machines/utils"
import { groupConnect, toastGlobalConnect } from "./toast-group.connect"
import { groupMachine } from "./toast-group.machine"
import { createToastMachine as createMachine } from "./toast.machine"

export { connect } from "./toast.connect"
export type { GroupMachineContext, MachineContext, MachineState, Placement, Service, Type } from "./toast.types"
export { createMachine }

export const group = {
  connect: groupConnect,
  machine: groupMachine,
}

export function global() {
  if (!isDom()) {
    warn("Toast.global() is only available in the browser")
  } else {
    return toastGlobalConnect
  }
}
