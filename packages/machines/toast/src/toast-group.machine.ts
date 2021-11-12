import { createMachine, Machine, ref } from "@ui-machines/core"
import { Context } from "../utils/types"
import { createToastMachine, ToastMachineContext, ToastMachineState } from "./toast.machine"

export type ToastGroupMachineContext = Context<{
  toasts: Machine<ToastMachineContext, ToastMachineState>[]
  max: number
}>

export const toastGroupMachine = createMachine<ToastGroupMachineContext>(
  {
    id: "toaster",
    initial: "active",
    context: {
      dir: "ltr",
      max: 20,
      uid: "toasts-machine",
      toasts: [],
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
        cond: (ctx) => ctx.toasts.length < ctx.max,
        actions: (ctx, evt) => {
          ctx.toasts.push(toastGroupMachine.spawn(createToastMachine(evt.toast)))
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
