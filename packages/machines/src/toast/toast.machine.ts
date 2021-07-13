import { createMachine, Machine } from "@ui-machines/core"
import { getToastDuration } from "./toast.utils"

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
  progress?: { max: number; value: number }
}

export type ToastMachineState = {
  value: "active" | "active:temp" | "dismissing" | "inactive" | "visible"
}

export type ToastMachine = Machine<ToastMachineContext, ToastMachineState>

export function createToastMachine(options: Partial<ToastMachineContext>) {
  const {
    type = "blank",
    role = "status",
    duration,
    id = "toast",
    ...rest
  } = options

  const timeout = getToastDuration(duration, type)

  const toast = createMachine<ToastMachineContext, ToastMachineState>(
    {
      id: options.id,
      initial: "active",
      context: {
        type,
        role,
        "aria-live": "polite",
        id,
        duration: timeout,
        progress: { max: timeout, value: timeout },
        ...rest,
      },
      on: {
        UPDATE: [
          {
            cond: "hasDurationChanged",
            target: "active:temp",
            actions: "updateToast",
          },
          { actions: "updateToast" },
        ],
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
          every: {
            PROGRESS_INTERVAL: "setProgress",
          },
          on: {
            DISMISS: "dismissing",
            PAUSE: {
              target: "visible",
              actions: "setDurationToProgress",
            },
            FORCE_DISMISS: {
              target: "inactive",
              actions: "notifyParent",
            },
          },
        },
        dismissing: {
          entry: "setProgress",
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
      guards: {
        hasDurationChanged(ctx, evt) {
          const { duration, type } = evt
          const durationChanged = duration != null && duration !== ctx.duration
          const typeChanged = type != null && type !== ctx.type
          return durationChanged || typeChanged
        },
      },
      delays: {
        VISIBLE_DURATION: (ctx) => ctx.duration!,
        DISMISS_DURATION: 1000,
        PROGRESS_INTERVAL: 10,
      },
      actions: {
        setDurationToProgress(ctx) {
          ctx.duration = ctx.progress?.value
        },
        setProgress(ctx) {
          if (!ctx.progress) return
          ctx.progress.value -= 10
        },
        notifyParent() {
          toast.sendParent({ type: "REMOVE_TOAST", id: toast.id })
        },
        setDuration(ctx, evt) {
          ctx.duration = evt.value
        },
        updateToast(ctx, evt) {
          const { duration: _duration, type: _type } = evt.toast
          const duration = getToastDuration(_duration, _type)

          for (const key in evt.toast) {
            ctx[key] = evt.toast[key]
          }

          if (_type && _duration == null) {
            ctx.duration = duration
          }
        },
      },
    },
  )

  return toast
}
