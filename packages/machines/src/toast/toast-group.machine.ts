import { createMachine, ref } from "@ui-machines/core"
import { isNumber } from "../utils/guard"
import { createToastMachine } from "./toast.machine"
import { ToastGroupMachineContext } from "./toast.types"

export const toastGroupMachine = createMachine<ToastGroupMachineContext>({
  id: "toaster",
  initial: "active",
  context: {
    dir: "ltr",
    max: 20,
    uid: "toasts-machine",
    toasts: [],
    spacing: "1rem",
    zIndex: 9999,
    pauseOnPageIdle: false,
    pauseOnHover: false,
  },
  computed: {
    spacingValue: (ctx) => (isNumber(ctx.spacing) ? `${ctx.spacing}px` : ctx.spacing),
  },
  on: {
    SETUP: {
      actions: (ctx, evt) => {
        ctx.uid = evt.id
        ctx.doc = ref(evt.doc)
      },
    },

    PAUSE_TOAST: {
      actions: (ctx, evt) => {
        toastGroupMachine.sendChild("PAUSE", evt.id)
      },
    },

    PAUSE_ALL: {
      actions: (ctx) => {
        ctx.toasts.forEach((toast) => toast.send("PAUSE"))
      },
    },

    RESUME_TOAST: {
      actions: (ctx, evt) => {
        toastGroupMachine.sendChild("RESUME", evt.id)
      },
    },

    RESUME_ALL: {
      actions: (ctx) => {
        ctx.toasts.forEach((toast) => toast.send("RESUME"))
      },
    },

    ADD_TOAST: {
      guard: (ctx) => ctx.toasts.length < ctx.max,
      actions: (ctx, evt) => {
        const options = {
          ...evt.toast,
          pauseOnPageIdle: ctx.pauseOnHover,
          pauseOnHover: ctx.pauseOnHover,
          dir: ctx.dir,
          doc: ref(ctx.doc ?? document),
        }
        const toast = createToastMachine(options)
        const actor = toastGroupMachine.spawn(toast)
        ctx.toasts.push(actor)
      },
    },

    UPDATE_TOAST: {
      actions: (_ctx, evt) => {
        toastGroupMachine.sendChild({ type: "UPDATE", toast: evt.toast }, evt.id)
      },
    },

    DISMISS_TOAST: {
      actions: (_ctx, evt) => {
        toastGroupMachine.sendChild("DISMISS", evt.id)
      },
    },

    DISMISS_ALL: {
      actions: (ctx) => {
        ctx.toasts.forEach((toast) => toast.send("DISMISS"))
      },
    },

    REMOVE_TOAST: {
      actions: (ctx, evt) => {
        toastGroupMachine.stopChild(evt.id)
        const index = ctx.toasts.findIndex((toast) => toast.id === evt.id)
        ctx.toasts.splice(index, 1)
      },
    },

    REMOVE_ALL: {
      actions: (ctx) => {
        ctx.toasts.forEach((toast) => toastGroupMachine.stopChild(toast.id))
        while (ctx.toasts.length) ctx.toasts.pop()
      },
    },
  },
})
