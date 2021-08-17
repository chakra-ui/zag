import { addPointerEvent } from "@core-dom/event/pointer"
import { NumericRange } from "@core-foundation/numeric-range"
import { noop } from "@core-foundation/utils/fn"
import { createMachine, guards, Machine } from "@ui-machines/core"
import { getToastDuration } from "./toast.utils"

const { or, not } = guards

export type ToastType = "success" | "error" | "loading" | "blank" | "custom"

export type ToastPlacement = "top-start" | "top" | "top-end" | "bottom-start" | "bottom" | "bottom-end"

export function getToastsByPlacement(toasts: ToastMachine[]) {
  const result: Partial<Record<ToastPlacement, ToastMachine[]>> = {}

  for (const toast of toasts) {
    const placement = toast.state.context.placement!
    result[placement] ||= []
    result[placement]!.push(toast)
  }

  return result
}

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
  onClose?: VoidFunction
  pauseOnPageIdle?: boolean
}

export type ToastMachineState = {
  value: "active" | "active:temp" | "dismissing" | "inactive" | "visible"
}

export type ToastMachine = Machine<ToastMachineContext, ToastMachineState>

export function createToastMachine(options: Partial<ToastMachineContext>) {
  const { type = "blank", role = "status", duration, id = "toast", ...rest } = options

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
        pauseOnPageIdle: false,
        ...rest,
      },
      on: {
        UPDATE: [
          {
            cond: or("hasDurationChanged", "hasTypeChanged"),
            target: "active:temp",
            actions: "setContext",
          },
          { actions: "setContext" },
        ],
      },
      states: {
        "active:temp": {
          after: {
            // we use this to force a re-entry into the "active" state
            0: "active",
          },
        },
        visible: {
          activities: "checkDocumentVisibility",
          on: {
            RESUME: "active",
            DISMISS: "dismissing",
          },
        },
        active: {
          activities: "checkDocumentVisibility",
          after: {
            VISIBLE_DURATION: "dismissing",
          },
          every: [
            {
              cond: not("isLoadingType"),
              actions: "setProgressValue",
              delay: "PROGRESS_INTERVAL",
            },
          ],
          on: {
            DISMISS: "dismissing",
            PAUSE: {
              target: "visible",
              actions: "setDurationToProgress",
            },
            FORCE_DISMISS: {
              target: "inactive",
              actions: "notifyParentToRemove",
            },
          },
        },
        dismissing: {
          entry: "clearProgressValue",
          after: {
            DISMISS_DURATION: {
              target: "inactive",
              actions: "notifyParentToRemove",
            },
          },
        },
        inactive: {
          entry: "invokeOnClose",
          type: "final",
        },
      },
    },
    {
      activities: {
        checkDocumentVisibility(ctx, evt, { send }) {
          if (!ctx.pauseOnPageIdle) return noop
          return addPointerEvent(document, "visibilitychange", () => {
            const doc = document as any
            const isPageHidden = doc.hidden || doc.msHidden || doc.webkitHidden
            send(isPageHidden ? "PAUSE" : "RESUME")
          })
        },
      },
      guards: {
        isLoadingType(ctx) {
          return ctx.type === "loading"
        },
        hasTypeChanged(ctx, evt) {
          return evt.type != null && evt.type !== ctx.type
        },
        hasDurationChanged(ctx, evt) {
          return evt.duration != null && evt.duration !== ctx.duration
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
        setProgressValue(ctx) {
          if (!ctx.progress) return
          const { max, value } = ctx.progress
          // adding `- 1` makes setInterval work consistently across browsers
          const range = new NumericRange({
            min: 0,
            max,
            step: 10,
            value: value - 1,
          })
          ctx.progress.value = range.decrement().clamp().valueOf()
        },
        clearProgressValue(ctx) {
          if (!ctx.progress) return
          ctx.progress.value = 0
        },
        notifyParentToRemove() {
          toast.sendParent({ type: "REMOVE_TOAST", id: toast.id })
        },
        invokeOnClose(ctx) {
          ctx.onClose?.()
        },
        setContext(ctx, evt) {
          const { duration: newDuration, type: newType } = evt.toast
          const duration = getToastDuration(newDuration, newType)

          for (const key in evt.toast) {
            ctx[key] = evt.toast[key]
          }

          if (newType && newDuration == null) {
            ctx.duration = duration
            ctx.progress!.value = duration
          }
        },
      },
    },
  )

  return toast
}
