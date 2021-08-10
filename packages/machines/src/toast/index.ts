import { connectToastGroupMachine } from "./toast-group.connect"
import { toastGroupMachine } from "./toast-group.machine"
import { connectToastMachine } from "./toast.connect"
import { createToastMachine } from "./toast.machine"

export const toast = {
  group: {
    connect: connectToastGroupMachine,
    machine: toastGroupMachine,
  },
  connect: connectToastMachine,
  createMachine: createToastMachine,
}

export type { ToastGroupMachineContext } from "./toast-group.machine"
export type { ToastMachine, ToastMachineContext, ToastMachineState, ToastPlacement, ToastType } from "./toast.machine"
