import { createMachine } from "@zag-js/core"
import { MAX_Z_INDEX } from "@zag-js/dom-query"
import { compact } from "@zag-js/utils"
import { createToastMachine } from "./toast.machine"
import type { GroupMachineContext, UserDefinedGroupContext } from "./toast.types"

export function groupMachine(userContext: UserDefinedGroupContext) {
  const ctx = compact(userContext)
  return createMachine<GroupMachineContext>({
    id: "toaster",
    initial: "active",
    context: {
      dir: "ltr",
      max: Number.MAX_SAFE_INTEGER,
      toasts: [],
      gutter: "1rem",
      zIndex: MAX_Z_INDEX,
      pauseOnPageIdle: false,
      pauseOnInteraction: true,
      offsets: { left: "0px", right: "0px", top: "0px", bottom: "0px" },
      ...ctx,
    },

    computed: {
      count: (ctx) => ctx.toasts.length,
    },

    on: {
      SETUP: {},

      PAUSE_TOAST: {
        actions: (_ctx, evt, { self }) => {
          self.sendChild("PAUSE", evt.id)
        },
      },

      PAUSE_ALL: {
        actions: (ctx) => {
          ctx.toasts.forEach((toast) => toast.send("PAUSE"))
        },
      },

      RESUME_TOAST: {
        actions: (_ctx, evt, { self }) => {
          self.sendChild("RESUME", evt.id)
        },
      },

      RESUME_ALL: {
        actions: (ctx) => {
          ctx.toasts.forEach((toast) => toast.send("RESUME"))
        },
      },

      ADD_TOAST: {
        guard: (ctx) => ctx.toasts.length < ctx.max,
        actions: (ctx, evt, { self }) => {
          const options = {
            ...ctx.defaultOptions,
            ...evt.toast,
            pauseOnPageIdle: ctx.pauseOnPageIdle,
            pauseOnInteraction: ctx.pauseOnInteraction,
            dir: ctx.dir,
            getRootNode: ctx.getRootNode,
          }
          const toast = createToastMachine(options)
          const actor = self.spawn(toast)
          ctx.toasts.push(actor)
        },
      },

      UPDATE_TOAST: {
        actions: (_ctx, evt, { self }) => {
          self.sendChild({ type: "UPDATE", toast: evt.toast }, evt.id)
        },
      },

      DISMISS_TOAST: {
        actions: (_ctx, evt, { self }) => {
          self.sendChild("DISMISS", evt.id)
        },
      },

      DISMISS_ALL: {
        actions: (ctx) => {
          ctx.toasts.forEach((toast) => toast.send("DISMISS"))
        },
      },

      REMOVE_TOAST: {
        actions: (ctx, evt, { self }) => {
          self.stopChild(evt.id)
          const index = ctx.toasts.findIndex((toast) => toast.id === evt.id)
          ctx.toasts.splice(index, 1)
        },
      },

      REMOVE_ALL: {
        actions: (ctx, _evt, { self }) => {
          ctx.toasts.forEach((toast) => self.stopChild(toast.id))
          while (ctx.toasts.length) ctx.toasts.pop()
        },
      },
    },
  })
}
