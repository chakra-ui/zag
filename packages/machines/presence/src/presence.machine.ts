import { createMachine, ref, guards } from "@zag-js/core"
import type { MachineContext, MachineState, UserDefinedContext } from "./presence.types"

const { and, or } = guards

function getAnimationName(styles?: CSSStyleDeclaration | null) {
  return styles?.animationName || "none"
}

export function machine(ctx: Partial<UserDefinedContext>) {
  const initialState = ctx.present ? "mounted" : "unmounted"
  return createMachine<MachineContext, MachineState>(
    {
      initial: initialState,
      watch: {
        present: ["raisePresenceChange", "setPrevPresent"],
      },
      on: {
        "NODE.SET": {
          actions: ["setNode", "setStyles"],
        },
        "PRESENCE.CHANGED": [
          {
            guard: "isPresent",
            target: "mounted",
            actions: ["setPrevAnimationName"],
          },
          {
            guard: or("isAnimationNone", "isDisplayNone"),
            target: "unmounted",
          },
          {
            guard: and("wasPresent", "isAnimating"),
            target: "unmountSuspended",
          },
          { target: "unmounted" },
        ],
      },
      states: {
        mounted: {
          on: {
            UNMOUNT: "unmounted",
            "ANIMATION.OUT": "unmountSuspended",
          },
        },
        unmountSuspended: {
          activities: ["trackAnimationEvents"],
          on: {
            MOUNT: {
              target: "mounted",
              actions: ["setPrevAnimationName"],
            },
            "ANIMATION.END": "unmounted",
          },
        },
        unmounted: {
          entry: ["clearPrevAnimationName"],
          on: {
            MOUNT: "mounted",
          },
        },
      },
    },
    {
      guards: {
        isPresent: (ctx) => !!ctx.present,
        isAnimationNone: (ctx) => getAnimationName(ctx.styles) === "none",
        isDisplayNone: (ctx) => ctx.styles?.display === "none",
        wasPresent: (ctx) => !!ctx.prevPresent,
        isAnimating: (ctx) => ctx.prevAnimationName !== getAnimationName(ctx.styles),
      },
      actions: {
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
        raisePresenceChange(_ctx, _evt, { send }) {
          send("PRESENCE.CHANGED")
        },
        setPrevPresent(ctx) {
          ctx.prevPresent = ctx.present
        },
        setPrevAnimationName(ctx) {
          requestAnimationFrame(() => {
            ctx.prevAnimationName = getAnimationName(ctx.styles)
          })
        },
        clearPrevAnimationName(ctx) {
          ctx.prevAnimationName = ""
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
            const currentAnimationName = getAnimationName(ctx.styles)
            const isCurrentAnimation = currentAnimationName.includes(event.animationName)
            if (event.target === node && isCurrentAnimation) {
              send("ANIMATION.END")
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
