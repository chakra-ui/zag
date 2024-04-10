import { createMachine, guards } from "@zag-js/core"
import { addDomEvent } from "@zag-js/dom-event"
import { raf } from "@zag-js/dom-query"
import { compact } from "@zag-js/utils"
import { dom } from "./toast.dom"
import type { MachineContext, MachineState, Options } from "./toast.types"
import { getToastDuration } from "./toast.utils"

const { not, and, or } = guards

export function createToastMachine<T>(options: Options<T> = {}) {
  const { type = "info", duration, id = "1", placement = "bottom", removeDelay = 0, ...restProps } = options
  const ctx = compact(restProps)

  const computedDuration = getToastDuration(duration, type)

  return createMachine<MachineContext<T>, MachineState>(
    {
      id,
      context: {
        id,
        type,
        remaining: computedDuration,
        duration: computedDuration,
        removeDelay,
        createdAt: Date.now(),
        placement,
        ...ctx,
        height: 0,
        offset: 0,
        frontmost: false,
        mounted: false,
        index: -1,
        zIndex: 0,
      },

      initial: type === "loading" ? "persist" : "active",

      on: {
        UPDATE: [
          {
            guard: and("hasTypeChanged", "isChangingToLoading"),
            target: "persist",
            actions: ["setContext"],
          },
          {
            guard: or("hasDurationChanged", "hasTypeChanged"),
            target: "active:temp",
            actions: ["setContext"],
          },
          {
            actions: ["setContext"],
          },
        ],
        REQUEST_HEIGHT: {
          actions: ["measureHeight"],
        },
      },

      entry: ["invokeOnOpen"],

      activities: ["trackHeight"],

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
        trackHeight(ctx, _evt, { self }) {
          let cleanup: VoidFunction
          raf(() => {
            const rootEl = dom.getRootEl(ctx)
            if (!rootEl) return
            ctx.mounted = true

            const syncHeight = () => {
              const originalHeight = rootEl.style.height
              rootEl.style.height = "auto"
              const { height: newHeight } = rootEl.getBoundingClientRect()
              rootEl.style.height = originalHeight

              ctx.height = newHeight
              self.sendParent({ type: "UPDATE_HEIGHT", id: self.id, height: newHeight, placement: ctx.placement })
            }

            syncHeight()

            const win = dom.getWin(ctx)

            const observer = new win.MutationObserver(syncHeight)
            observer.observe(rootEl, { childList: true, subtree: true, characterData: true })

            cleanup = () => observer.disconnect()
          })

          return () => cleanup?.()
        },
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
        measureHeight(ctx, _evt, { self }) {
          raf(() => {
            const rootEl = dom.getRootEl(ctx)
            if (!rootEl) return

            ctx.mounted = true

            const originalHeight = rootEl.style.height
            rootEl.style.height = "auto"

            const newHeight = rootEl.offsetHeight
            rootEl.style.height = originalHeight
            ctx.height = newHeight

            self.sendParent({ type: "UPDATE_HEIGHT", id: self.id, height: newHeight, placement: ctx.placement })
          })
        },
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
          ctx.onOpenChange?.({ open: true })
        },
        invokeOnOpen(ctx) {
          ctx.onOpenChange?.({ open: false })
        },
        setContext(ctx, evt) {
          const { duration, type } = evt.toast
          if (duration == null && type == null) {
            Object.assign(ctx, evt.toast)
          } else {
            const time = getToastDuration(duration, type)
            Object.assign(ctx, { ...evt.toast, duration: time, remaining: time })
          }
        },
      },
    },
  )
}
