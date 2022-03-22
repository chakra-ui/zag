import { createMachine, guards } from "@ui-machines/core"
import { trackDocumentVisibility } from "@ui-machines/dom-utils"
import { dom } from "./toast.dom"
import { MachineContext, MachineState, Options } from "./toast.types"
import { getToastDuration } from "./toast.utils"

const { not, and, or } = guards

export function createToastMachine(options: Options = {}) {
  const { type = "info", duration, id = "toast", placement = "bottom", removeDelay = 1000, ...rest } = options
  const timeout = getToastDuration(duration, type)

  return createMachine<MachineContext, MachineState>(
    {
      id,
      initial: "active",
      entry: ["invokeOnEntered"],
      context: {
        id,
        type,
        duration: timeout,
        removeDelay,
        progress: { max: timeout, value: timeout },
        placement,
        ...rest,
      },

      computed: {
        progressPercent: (ctx) => ctx.progress.value / ctx.progress.max,
      },

      on: {
        UPDATE: [
          {
            guard: and("hasTypeChanged", "isLoadingType"),
            target: "persist",
            actions: ["setContext", "invokeOnUpdate"],
          },
          {
            guard: or("hasDurationChanged", "hasTypeChanged"),
            target: "active:temp",
            actions: ["setContext", "invokeOnUpdate"],
          },
          {
            actions: ["setContext", "invokeOnUpdate"],
          },
        ],
      },

      states: {
        "active:temp": {
          tags: ["visible"],
          after: {
            // force a re-entry into the "active" state
            NOW: "active",
          },
        },

        persist: {
          tags: ["visible"],
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
          tags: ["visible"],
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
              target: "persist",
              actions: "setDurationToProgress",
            },
          },
        },

        dismissing: {
          entry: ["clearProgressValue", "invokeOnExiting"],
          after: {
            REMOVE_DELAY: {
              target: "inactive",
              actions: "notifyParentToRemove",
            },
          },
        },

        inactive: {
          entry: "invokeOnExited",
          type: "final",
        },
      },
    },
    {
      activities: {
        trackDocumentVisibility(ctx, _evt, { send }) {
          if (!ctx.pauseOnPageIdle) return
          return trackDocumentVisibility(dom.getDoc(ctx), function (hidden) {
            send(hidden ? "PAUSE" : "RESUME")
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
          ctx.duration = ctx.progress.value
        },
        setProgressValue(ctx) {
          ctx.progress.value -= 10
        },
        clearProgressValue(ctx) {
          ctx.progress.value = 0
        },
        notifyParentToRemove(_ctx, _evt, { self }) {
          self.sendParent({ type: "REMOVE_TOAST", id: self.id })
        },
        invokeOnExiting(ctx) {
          ctx.onExiting?.()
        },
        invokeOnExited(ctx) {
          ctx.onExited?.()
        },
        invokeOnEntered(ctx) {
          ctx.onEntered?.()
        },
        invokeOnUpdate(ctx) {
          ctx.onUpdate?.()
        },
        setContext(ctx, evt) {
          const { duration: newDuration, type: newType } = evt.toast
          const duration = getToastDuration(newDuration, newType)

          for (const key in evt.toast) {
            ctx[key] = evt.toast[key]
          }

          if (newType && newDuration == null) {
            ctx.duration = duration
            ctx.progress.value = duration
          }
        },
      },
    },
  )
}
