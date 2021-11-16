import { createMachine, ref } from "@ui-machines/core"
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
      spacingValue: (ctx) => {
        return typeof ctx.spacing === "number" ? `${ctx.spacing}px` : ctx.spacing
      },
    },
    on: {
      MOUNT: {
        actions: ["setId", "setOwnerDocument"],
      },
      DISMISS_ALL: {
        actions: (ctx) => {
          ctx.toasts.forEach((toast) => {
            toast.send("DISMISS")
          })
        },
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
          ctx.toasts.forEach((toast) => {
            toast.send("PAUSE")
          })
        },
      },
      RESUME_ALL: {
        actions: (ctx) => {
          ctx.toasts.forEach((toast) => {
            toast.send("RESUME")
          })
        },
      },
      ADD_TOAST: {
        guard: (ctx) => ctx.toasts.length < ctx.max,
        actions: (ctx, evt) => {
          const toast = createToastMachine(evt.toast).withContext({ doc: ctx.doc })
          const actor = toastGroupMachine.spawn(toast)
          ctx.toasts.push(actor)
        },
      },
      UPDATE_TOAST: {
        actions: (ctx, evt) => {
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
      REMOVE_TOAST: {
        actions: (ctx, evt) => {
          toastGroupMachine.stopChild(evt.id)
          ctx.toasts = ctx.toasts.filter((toast) => toast.id !== evt.id)
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
