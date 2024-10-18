import { createMachine, ref } from "@zag-js/core"
import type { MachineContext, MachineState, UserDefinedContext } from "./presence.types"

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
          after: {
            // Fallback to timeout to ensure we exit this state even if the `animationend` event
            // did not get trigger
            ANIMATION_DURATION: {
              target: "unmounted",
              actions: ["invokeOnExitComplete"],
            },
          },
          on: {
            MOUNT: {
              target: "mounted",
              actions: ["setPrevAnimationName"],
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
      delays: {
        ANIMATION_DURATION(ctx) {
          return parseMs(ctx.styles?.animationDuration) + parseMs(ctx.styles?.animationDelay) + ANIMATION_TIMEOUT_MARGIN
        },
      },
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

          if (!ctx.present && ctx.node?.ownerDocument.visibilityState === "hidden") {
            send({ type: "UNMOUNT", src: "visibilitychange" })
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
            const target = event.composedPath?.()?.[0] ?? event.target
            if (target === node) {
              ctx.prevAnimationName = getAnimationName(ctx.styles)
            }
          }

          const onEnd = (event: AnimationEvent) => {
            const animationName = getAnimationName(ctx.styles)
            const target = event.composedPath?.()?.[0] ?? event.target
            if (target === node && animationName === ctx.unmountAnimationName) {
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

function getAnimationName(styles?: CSSStyleDeclaration | null) {
  return styles?.animationName || "none"
}

function parseMs(value: string | undefined) {
  return parseFloat(value || "0") * 1000
}

// Extra frame margin to account for event loop slowdowns
const ANIMATION_TIMEOUT_MARGIN = 16.667
