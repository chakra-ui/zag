import { createMachine, guards } from "@zag-js/core"
import { queryAll, raf } from "@zag-js/dom-query"
import { compact, warn } from "@zag-js/utils"
import { dom } from "./toast.dom"
import type { MachineContext, MachineState, Options } from "./toast.types"
import { getToastDuration } from "./toast.utils"

const { not, and, or } = guards

export function createToastMachine<T>(options: Options<T>) {
  const { type = "info", duration, id = "1", placement = "bottom", removeDelay = 200, ...restProps } = options
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

      initial: type === "loading" ? "visible:persist" : "visible",

      on: {
        UPDATE: [
          {
            guard: and("hasTypeChanged", "isChangingToLoading"),
            target: "visible:persist",
            actions: ["setContext"],
          },
          {
            guard: or("hasDurationChanged", "hasTypeChanged"),
            target: "visible:updating",
            actions: ["setContext"],
          },
          {
            actions: ["setContext"],
          },
        ],
        MEASURE: {
          actions: ["measureHeight"],
        },
      },

      entry: ["invokeOnVisible"],

      activities: ["trackHeight"],

      states: {
        "visible:updating": {
          tags: ["visible", "updating"],
          after: {
            0: "visible",
          },
        },

        "visible:persist": {
          tags: ["visible", "paused"],
          on: {
            RESUME: {
              guard: not("isLoadingType"),
              target: "visible",
              actions: ["setCreatedAt"],
            },
            DISMISS: "dismissing",
          },
        },

        visible: {
          tags: ["visible"],
          after: {
            VISIBLE_DURATION: "dismissing",
          },
          on: {
            DISMISS: "dismissing",
            PAUSE: {
              target: "visible:persist",
              actions: "setRemainingDuration",
            },
          },
        },

        dismissing: {
          entry: "invokeOnDismiss",
          after: {
            REMOVE_DELAY: {
              target: "unmounted",
              actions: "notifyParentToRemove",
            },
          },
        },

        unmounted: {
          entry: "invokeOnUnmount",
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

            const ghosts = queryAll(rootEl, "[data-ghost]")

            warn(
              ghosts.length !== 2,
              "[toast] No ghost element found in toast. Render the `ghostBefore` and `ghostAfter` elements",
            )

            const syncHeight = () => {
              const originalHeight = rootEl.style.height
              rootEl.style.height = "auto"
              const newHeight = rootEl.getBoundingClientRect().height
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
      },

      guards: {
        isChangingToLoading: (_, evt) => evt.toast?.type === "loading",
        isLoadingType: (ctx) => ctx.type === "loading",
        hasTypeChanged: (ctx, evt) => evt.toast?.type != null && evt.toast.type !== ctx.type,
        hasDurationChanged: (ctx, evt) => evt.toast?.duration != null && evt.toast.duration !== ctx.duration,
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

            const newHeight = rootEl.getBoundingClientRect().height
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
        invokeOnDismiss(ctx) {
          ctx.onStatusChange?.({ status: "dismissing" })
        },
        invokeOnUnmount(ctx) {
          ctx.onStatusChange?.({ status: "unmounted" })
        },
        invokeOnVisible(ctx) {
          ctx.onStatusChange?.({ status: "visible" })
        },
        setContext(ctx, evt) {
          const duration = evt.toast?.duration
          const type = evt.toast?.type ?? ctx.type

          const computedDuration = getToastDuration(duration, type)

          Object.assign(ctx, {
            ...evt.toast,
            duration: computedDuration,
            remaining: computedDuration,
          })
        },
      },
    },
  )
}
