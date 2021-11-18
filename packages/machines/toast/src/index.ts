import { toastGroupConnect } from "./toast-group.connect"
import { toastGroupMachine } from "./toast-group.machine"
import { toastConnect } from "./toast.connect"
import { createToastMachine } from "./toast.machine"

export const toast = {
  group: {
    connect: toastGroupConnect,
    machine: toastGroupMachine,
  },
  connect: toastConnect,
  createMachine: createToastMachine,
}

export type { ToastGroupMachineContext, ToastMachine, ToastMachineContext, ToastMachineState, ToastPlacement, ToastType } from "./toast.types"
