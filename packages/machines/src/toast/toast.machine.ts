import { createMachine, Machine } from "@chakra-ui/machine"
import { defaultTimeouts } from "./toast.utils"

export type ToastType = "success" | "error" | "loading" | "blank" | "custom"

export type ToastPlacement =
  | "top-start"
  | "top"
  | "top-end"
  | "bottom-start"
  | "bottom"
  | "bottom-end"

export type ToastMachineContext = {
  id: string
  type: ToastType
  placement?: ToastPlacement
  title?: string
  description?: string
  role: "status" | "alert"
  "aria-live": "assertive" | "off" | "polite"
  duration?: number
}

export type ToastMachineState = {
  value: "active" | "active:temp" | "dismissing" | "inactive" | "visible"
}

export type ToastMachine = Machine<ToastMachineContext, ToastMachineState>

export function createToastMachine(options: Partial<ToastMachineContext>) {
  const toast = createMachine<ToastMachineContext, ToastMachineState>(
    {
      id: options.id,
      initial: "active",
      context: {
        type: "blank",
        role: "status",
        "aria-live": "polite",
        id: "toast",
        duration: 3000,
        ...options,
      },
      on: {
        UPDATE: {
          actions: "updateToast",
        },
      },
      states: {
        "active:temp": {
          after: {
            0: "active",
          },
        },
        visible: {
          on: {
            RESUME: "active",
          },
        },
        active: {
          after: {
            VISIBLE_DURATION: "dismissing",
          },
          on: {
            DISMISS: "dismissing",
            PAUSE: "visible",
            CHANGE_DURATION: {
              target: "active:temp",
              actions: "setDuration",
            },
          },
        },
        dismissing: {
          after: {
            DISMISS_DURATION: {
              target: "inactive",
              actions: "notifyParent",
            },
          },
        },
        inactive: {
          type: "final",
        },
      },
    },
    {
      delays: {
        VISIBLE_DURATION: (ctx) => ctx.duration ?? defaultTimeouts[ctx.type],
        DISMISS_DURATION: 600,
      },
      actions: {
        notifyParent() {
          toast.sendParent({ type: "REMOVE_TOAST", id: toast.id })
        },
        setDuration(ctx, evt) {
          ctx.duration = evt.value
        },
        updateToast(ctx, evt) {
          for (const key in evt.toast) {
            ctx[key] = evt.toast[key]
          }
        },
      },
    },
  )

  return toast
}
