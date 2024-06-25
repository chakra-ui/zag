import { createMachine, ref } from "@zag-js/core"
import type { MachineContext, MachineState, UserDefinedContext } from "./presence.types"

function getAnimationName(styles?: CSSStyleDeclaration | null) {
  return styles?.animationName || "none"
}

export function machine(ctx: Partial<UserDefinedContext>) {
  return createMachine<MachineContext, MachineState>(
    {
      initial: ctx.present ? "mounted" : "unmounted",

      context: {
        node: null,
        styles: null,
        unmountAnimationName: null,
        prevAnimationName: null,
        present: false,
        initial: false,
        ...ctx,
      },

      exit: ["clearInitial"],

      watch: {
        present: ["setInitial", "syncPresence"],
      },

      on: {
        "NODE.SET": {
          actions: ["setNode", "setStyles"],
        },
      },

      states: {
        mounted: {
          on: {
            UNMOUNT: {
              target: "unmounted",
              actions: ["invokeOnExitComplete"],
            },
            "UNMOUNT.SUSPEND": "unmountSuspended",
          },
        },
        unmountSuspended: {
          activities: ["trackAnimationEvents"],
          on: {
            MOUNT: {
              target: "mounted",
              actions: ["setPrevAnimationName"],
            },
            "ANIMATION.END": {
              target: "unmounted",
              actions: ["invokeOnExitComplete"],
            },
            UNMOUNT: {
              target: "unmounted",
              actions: ["invokeOnExitComplete"],
            },
          },
        },
        unmounted: {
          entry: ["clearPrevAnimationName"],
          on: {
            MOUNT: {
              target: "mounted",
              actions: ["setPrevAnimationName"],
            },
          },
        },
      },
    },
    {
      actions: {
        setInitial(ctx) {
          ctx.initial = true
        },
        clearInitial(ctx) {
          ctx.initial = false
        },
        invokeOnExitComplete(ctx) {
          ctx.onExitComplete?.()
        },
        setNode(ctx, evt) {
          ctx.node = ref(evt.node)
        },
        setStyles(ctx, evt) {
          const win = evt.node.ownerDocument.defaultView || window
          ctx.styles = ref(win.getComputedStyle(evt.node))
        },
        syncPresence(ctx, _evt, { send }) {
          if (ctx.present) {
            send({ type: "MOUNT", src: "presence.changed" })
            return
          }

          const animationName = getAnimationName(ctx.styles)
          const exec = ctx.immediate ? queueMicrotask : requestAnimationFrame

          exec(() => {
            ctx.unmountAnimationName = animationName
            if (
              animationName === "none" ||
              animationName === ctx.prevAnimationName ||
              ctx.styles?.display === "none" ||
              ctx.styles?.animationDuration === "0s"
            ) {
              send({ type: "UNMOUNT", src: "presence.changed" })
            } else {
              send({ type: "UNMOUNT.SUSPEND" })
            }
          })
        },
        setPrevAnimationName(ctx) {
          const exec = ctx.immediate ? queueMicrotask : requestAnimationFrame
          exec(() => {
            ctx.prevAnimationName = getAnimationName(ctx.styles)
          })
        },
        clearPrevAnimationName(ctx) {
          ctx.prevAnimationName = null
        },
      },
      activities: {
        trackAnimationEvents(ctx, _evt, { send }) {
          const node = ctx.node
          if (!node) return

          const onStart = (event: AnimationEvent) => {
            if (event.target === node) {
              ctx.prevAnimationName = getAnimationName(ctx.styles)
            }
          }

          const onEnd = (event: AnimationEvent) => {
            const animationName = getAnimationName(ctx.styles)
            if (event.target === node && animationName === ctx.unmountAnimationName) {
              send({ type: "UNMOUNT", src: "animationend" })
            }
          }

          node.addEventListener("animationstart", onStart)
          node.addEventListener("animationcancel", onEnd)
          node.addEventListener("animationend", onEnd)

          return () => {
            node.removeEventListener("animationstart", onStart)
            node.removeEventListener("animationcancel", onEnd)
            node.removeEventListener("animationend", onEnd)
          }
        },
      },
    },
  )
}
