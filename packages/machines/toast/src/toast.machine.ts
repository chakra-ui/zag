import { createMachine, guards } from "@zag-js/core"
import { addDomEvent } from "@zag-js/dom-event"
import { compact } from "@zag-js/utils"
import { dom } from "./toast.dom"
import type { MachineContext, MachineState, Options } from "./toast.types"
import { getToastDuration } from "./toast.utils"

const { not, and, or } = guards

export function createToastMachine(options: Options = {}) {
  const { type = "info", duration, id = "toast", placement = "bottom", removeDelay = 0, ...restProps } = options
  const ctx = compact(restProps)

  const computedDuration = getToastDuration(duration, type)

  return createMachine<MachineContext, MachineState>(
    {
      id,
      entry: "invokeOnOpen",
      initial: type === "loading" ? "persist" : "active",
      context: {
        id,
        type,
        remaining: computedDuration,
        duration: computedDuration,
        removeDelay,
        createdAt: Date.now(),
        placement,
        ...ctx,
      },

      on: {
        UPDATE: [
          {
            guard: and("hasTypeChanged", "isChangingToLoading"),
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
          tags: ["visible", "updating"],
          after: {
            0: "active",
          },
        },

        persist: {
          tags: ["visible", "paused"],
          activities: "trackDocumentVisibility",
          on: {
            RESUME: {
              guard: not("isLoadingType"),
              target: "active",
              actions: ["setCreatedAt"],
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
          on: {
            DISMISS: "dismissing",
            PAUSE: {
              target: "persist",
              actions: "setRemainingDuration",
            },
          },
        },

        dismissing: {
          entry: "invokeOnClosing",
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
          if (!ctx.pauseOnPageIdle) return
          const doc = dom.getDoc(ctx)
          return addDomEvent(doc, "visibilitychange", () => {
            send(doc.visibilityState === "hidden" ? "PAUSE" : "RESUME")
          })
        },
      },

      guards: {
        isChangingToLoading: (_, evt) => evt.toast?.type === "loading",
        isLoadingType: (ctx) => ctx.type === "loading",
        hasTypeChanged: (ctx, evt) => evt.toast?.type !== ctx.type,
        hasDurationChanged: (ctx, evt) => evt.toast?.duration !== ctx.duration,
      },

      delays: {
        VISIBLE_DURATION: (ctx) => ctx.remaining,
        REMOVE_DELAY: (ctx) => ctx.removeDelay,
      },

      actions: {
        setRemainingDuration(ctx) {
          ctx.remaining -= Date.now() - ctx.createdAt
        },
        setCreatedAt(ctx) {
          ctx.createdAt = Date.now()
        },
        notifyParentToRemove(_ctx, _evt, { self }) {
          self.sendParent({ type: "REMOVE_TOAST", id: self.id })
        },
        invokeOnClosing(ctx) {
          ctx.onClosing?.()
        },
        invokeOnClose(ctx) {
          ctx.onClose?.()
        },
        invokeOnOpen(ctx) {
          ctx.onOpen?.()
        },
        invokeOnUpdate(ctx) {
          ctx.onUpdate?.()
        },
        setContext(ctx, evt) {
          const { duration, type } = evt.toast
          const time = getToastDuration(duration, type)
          Object.assign(ctx, { ...evt.toast, duration: time, remaining: time })
        },
      },
    },
  )
}
