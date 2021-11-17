import { createMachine, ref } from "@ui-machines/core"
import { isNumber } from "../utils/guard"
import { createToastMachine } from "./toast.machine"
import { ToastGroupMachineContext } from "./toast.types"

export const toastGroupMachine = createMachine<ToastGroupMachineContext>(
  {
    id: "toaster",
    initial: "active",
    context: {
      dir: "ltr",
      max: 20,
      uid: "toasts-machine",
      toasts: [],
      spacing: "1rem",
      zIndex: 9999,
    },
    computed: {
      spacingValue: (ctx) => (isNumber(ctx.spacing) ? `${ctx.spacing}px` : ctx.spacing),
    },
    on: {
      SETUP: {
        actions: ["setId", "setOwnerDocument"],
      },

      PAUSE_TOAST: {
        actions: (ctx, evt) => {
          const toast = ctx.toasts.find((toast) => toast.id === evt.id)
          if (!toast) return
          toastGroupMachine.sendChild("PAUSE", toast.id)
        },
      },

      PAUSE_ALL: {
        actions: (ctx) => {
          ctx.toasts.forEach((toast) => toast.send("PAUSE"))
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
          const toast = createToastMachine({ ...evt.toast, doc: ref(ctx.doc ?? document) })
          ctx.toasts.push(toastGroupMachine.spawn(toast))
        },
      },

      UPDATE_TOAST: {
        actions: (_ctx, evt) => {
          toastGroupMachine.sendChild({ type: "UPDATE", toast: evt.toast }, evt.id)
        },
      },

      DISMISS_TOAST: {
        actions: (ctx, evt) => {
          const toast = ctx.toasts.find((toast) => toast.id === evt.id)
          if (!toast) return
          toastGroupMachine.sendChild("DISMISS", toast.id)
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
          ctx.toasts = ctx.toasts.filter((toast) => toast.id !== evt.id)
        },
      },

      REMOVE_ALL: {
        actions: (ctx) => {
          ctx.toasts.forEach((toast) => toastGroupMachine.stopChild(toast.id))
          while (ctx.toasts.length) ctx.toasts.pop()
        },
      },
    },
  },
  {
    actions: {
      setId: (ctx, evt) => {
        ctx.uid = evt.id
      },
      setOwnerDocument: (ctx, evt) => {
        ctx.doc = ref(evt.doc)
      },
    },
  },
)
