import { createMachine, guards } from "@zag-js/core"
import { addDomEvent } from "@zag-js/dom-event"
import { raf } from "@zag-js/dom-query"
import { compact } from "@zag-js/utils"
import { dom } from "./toast.dom"
import type { MachineContext, MachineState, Options } from "./toast.types"
import { getToastDuration } from "./toast.utils"

const { not, and, or } = guards

export function createToastMachine(options: Options = {}) {
  const { type = "info", duration, id = "toast", placement = "bottom", ...restProps } = options
  const ctx = compact(restProps)

  const computedDuration = getToastDuration(duration, type)

  return createMachine<MachineContext, MachineState>(
    {
      id,
      entry: ["invokeOnOpen", "checkAnimation"],
      exit: "notifyParentToRemove",
      initial: type === "loading" ? "persist" : "active",
      context: {
        id,
        type,
        duration: computedDuration,
        placement,
        ...ctx,
        createdAt: Date.now(),
        remaining: computedDuration,
        hasAnimation: true,
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
            DISMISS: [
              { guard: "hasAnimation", target: "dismissing" },
              { target: "inactive", actions: "invokeOnClosing" },
            ],
          },
        },

        active: {
          tags: ["visible"],
          activities: "trackDocumentVisibility",
          after: [
            { delay: "VISIBLE_DURATION", guard: "hasAnimation", target: "dismissing" },
            { delay: "VISIBLE_DURATION", target: "inactive", actions: "invokeOnClosing" },
          ],
          on: {
            DISMISS: [
              { guard: "hasAnimation", target: "dismissing" },
              { target: "inactive", actions: "invokeOnClosing" },
            ],
            PAUSE: {
              target: "persist",
              actions: "setRemainingDuration",
            },
          },
        },

        dismissing: {
          entry: "invokeOnClosing",
          activities: ["trackAnimationEvents"],
          on: {
            ANIMATION_END: {
              target: "inactive",
            },
          },
        },

        inactive: {
          entry: ["invokeOnClose"],
          type: "final",
        },
      },
    },
    {
      activities: {
        trackAnimationEvents(ctx, _evt, { send }) {
          const node = dom.getRootEl(ctx)
          if (!node) return

          const onEnd = (event: AnimationEvent) => {
            if (event.currentTarget === node) {
              send("ANIMATION_END")
            }
          }

          node.addEventListener("animationcancel", onEnd)
          node.addEventListener("animationend", onEnd)

          return () => {
            node.removeEventListener("animationcancel", onEnd)
            node.removeEventListener("animationend", onEnd)
          }
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
        hasAnimation: (ctx) => ctx.hasAnimation,
      },

      delays: {
        VISIBLE_DURATION: (ctx) => ctx.remaining,
      },

      actions: {
        setRemainingDuration(ctx) {
          ctx.remaining -= Date.now() - ctx.createdAt
        },
        setCreatedAt(ctx) {
          ctx.createdAt = Date.now()
        },
        notifyParentToRemove(_ctx, _evt, { self }) {
          setTimeout(() => {
            self.sendParent({ type: "REMOVE_TOAST", id: self.id })
          }, 100)
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
        checkAnimation(ctx) {
          raf(() => {
            const animations = dom.getRootEl(ctx)?.getAnimations() ?? []
            ctx.hasAnimation = animations.length > 0
          })
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
