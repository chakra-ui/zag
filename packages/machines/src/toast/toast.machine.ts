import { createMachine, guards } from "@ui-machines/core"
import { addDomEvent } from "../utils/dom-event"
import { noop } from "../utils/fn"
import { dom } from "./toast.dom"
import { ToastMachineContext, ToastMachineState, ToastOptions } from "./toast.types"
import { getToastDuration } from "./toast.utils"

const { not, and, or } = guards

export function createToastMachine(options: ToastOptions = {}) {
  const { type = "info", duration, id = "toast", placement = "bottom", removeDelay = 1000, ...rest } = options

  const timeout = getToastDuration(duration, type)

  const toast = createMachine<ToastMachineContext, ToastMachineState>(
    {
      id,
      initial: "active",
      context: {
        id,
        type,
        duration: timeout,
        removeDelay,
        progress: { max: timeout, value: timeout },
        placement,
        ...rest,
      },

      on: {
        UPDATE: [
          {
            guard: and("hasTypeChanged", "isLoadingType"),
            target: "visible",
            actions: "setContext",
          },
          {
            guard: or("hasDurationChanged", "hasTypeChanged"),
            target: "active:temp",
            actions: "setContext",
          },
          {
            actions: "setContext",
          },
        ],
      },

      states: {
        "active:temp": {
          after: {
            // force a re-entry into the "active" state
            NOW: "active",
          },
        },

        visible: {
          activities: "trackDocumentVisibility",
          on: {
            RESUME: {
              guard: not("isLoadingType"),
              target: "active",
            },
            DISMISS: "dismissing",
          },
        },

        active: {
          activities: "trackDocumentVisibility",
          after: {
            VISIBLE_DURATION: "dismissing",
          },
          every: [
            {
              guard: not("isLoadingType"),
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
          },
        },

        dismissing: {
          entry: "clearProgressValue",
          after: {
            REMOVE_DELAY: {
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
        trackDocumentVisibility(ctx, _evt, { send }) {
          if (!ctx.pauseOnPageIdle) return noop
          const doc = dom.getDoc(ctx) as Document & { msHidden?: boolean; webkitHidden?: string }
          return addDomEvent(doc, "visibilitychange", () => {
            const isPageHidden = doc.hidden || doc.msHidden || doc.webkitHidden
            send(isPageHidden ? "PAUSE" : "RESUME")
          })
        },
      },
      guards: {
        isLoadingType: (ctx, evt) => evt.toast?.type === "loading" || ctx.type === "loading",
        hasTypeChanged: (ctx, evt) => evt.toast?.type !== ctx.type,
        hasDurationChanged: (ctx, evt) => evt.toast?.duration !== ctx.duration,
      },
      delays: {
        VISIBLE_DURATION: (ctx) => ctx.duration,
        REMOVE_DELAY: (ctx) => ctx.removeDelay,
        PROGRESS_INTERVAL: 10,
        NOW: 0,
      },
      actions: {
        setDurationToProgress(ctx) {
          ctx.duration = ctx.progress?.value
        },
        setProgressValue(ctx) {
          ctx.progress.value -= 10
        },
        clearProgressValue(ctx) {
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
