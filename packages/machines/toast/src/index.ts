import { isDom, warn } from "@ui-machines/utils"
import { toastGlobalConnect, toastGroupConnect } from "./toast-group.connect"
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
  global: () => {
    if (!isDom()) {
      warn("Toast.global() is only available in the browser")
    } else {
      return toastGlobalConnect
    }
  },
}

export type {
  ToastGroupMachineContext,
  ToastMachine,
  ToastMachineContext,
  ToastMachineState,
  ToastPlacement,
  ToastType,
} from "./toast.types"
