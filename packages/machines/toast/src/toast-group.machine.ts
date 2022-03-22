import { createMachine, ref } from "@ui-machines/core"
import { MAX_Z_INDEX } from "@ui-machines/dom-utils"
import { createToastMachine } from "./toast.machine"
import { GroupMachineContext } from "./toast.types"

export const groupMachine = createMachine<GroupMachineContext>({
  id: "toaster",
  initial: "active",
  context: {
    dir: "ltr",
    max: Number.MAX_SAFE_INTEGER,
    uid: "",
    toasts: [],
    spacing: "1rem",
    zIndex: MAX_Z_INDEX,
    pauseOnPageIdle: false,
    pauseOnInteraction: true,
    offsets: { left: 0, right: 0, top: 0, bottom: 0 },
  },

  computed: {
    count: (ctx) => ctx.toasts.length,
    spacingValue: (ctx) => {
      return typeof ctx.spacing === "number" ? `${ctx.spacing}px` : ctx.spacing
    },
  },

  on: {
    SETUP: {
      actions: (ctx, evt) => {
        ctx.uid = evt.id
        ctx.doc = ref(evt.doc)
      },
    },

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
          ...evt.toast,
          pauseOnPageIdle: ctx.pauseOnPageIdle,
          pauseOnHover: ctx.pauseOnInteraction,
          dir: ctx.dir,
          doc: ref(ctx.doc ?? document),
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
