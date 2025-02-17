import { getComputedStyle, getEventTarget, nextTick, raf, setStyle } from "@zag-js/dom-query"
import { createMachine } from "@zag-js/core"
import type { PresenceSchema } from "./presence.types"

export const machine = createMachine<PresenceSchema>({
  props({ props }) {
    return { ...props, present: !!props.present }
  },

  initialState() {
    return "unmounted"
  },

  refs() {
    return {
      node: null,
      styles: null,
    }
  },

  context({ bindable }) {
    return {
      unmountAnimationName: bindable<string | null>(() => ({ defaultValue: null })),
      prevAnimationName: bindable<string | null>(() => ({ defaultValue: null })),
      present: bindable<boolean>(() => ({ defaultValue: false })),
      initial: bindable<boolean>(() => ({ defaultValue: false })),
    }
  },

  exit: ["clearInitial", "cleanupNode"],

  watch({ track, action, prop }) {
    track([() => prop("present")], () => {
      action(["setInitial", "syncPresence"])
    })
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
          actions: ["clearPrevAnimationName", "invokeOnExitComplete"],
        },
        "UNMOUNT.SUSPEND": {
          target: "unmountSuspended",
        },
      },
    },
    unmountSuspended: {
      effects: ["trackAnimationEvents"],
      on: {
        MOUNT: {
          target: "mounted",
          actions: ["setPrevAnimationName"],
        },
        UNMOUNT: {
          target: "unmounted",
          actions: ["clearPrevAnimationName", "invokeOnExitComplete"],
        },
      },
    },
    unmounted: {
      on: {
        MOUNT: {
          target: "mounted",
          actions: ["setPrevAnimationName"],
        },
      },
    },
  },

  implementations: {
    actions: {
      setInitial: ({ context }) => {
        context.set("initial", true)
      },
      clearInitial: ({ context }) => {
        context.set("initial", false)
      },
      cleanupNode: ({ refs }) => {
        refs.set("node", null)
        refs.set("styles", null)
      },
      invokeOnExitComplete: ({ prop }) => {
        prop("onExitComplete")?.()
      },

      setNode: ({ refs, event }) => {
        refs.set("node", event.node)
      },

      setStyles: ({ refs, event }) => {
        refs.set("styles", getComputedStyle(event.node))
      },

      syncPresence: ({ context, refs, send, prop }) => {
        const presentProp = prop("present")
        if (presentProp) {
          return send({ type: "MOUNT", src: "presence.changed" })
        }

        const node = refs.get("node")
        if (!presentProp && node?.ownerDocument.visibilityState === "hidden") {
          return send({ type: "UNMOUNT", src: "visibilitychange" })
        }

        raf(() => {
          const animationName = getAnimationName(refs.get("styles"))
          context.set("unmountAnimationName", animationName)
          if (
            animationName === "none" ||
            animationName === context.get("prevAnimationName") ||
            refs.get("styles")?.display === "none" ||
            refs.get("styles")?.animationDuration === "0s"
          ) {
            send({ type: "UNMOUNT", src: "presence.changed" })
          } else {
            send({ type: "UNMOUNT.SUSPEND" })
          }
        })
      },

      setPrevAnimationName: ({ context, refs }) => {
        raf(() => {
          context.set("prevAnimationName", getAnimationName(refs.get("styles")))
        })
      },

      clearPrevAnimationName: ({ context }) => {
        context.set("prevAnimationName", null)
      },
    },

    effects: {
      trackAnimationEvents: ({ context, refs, send }) => {
        const node = refs.get("node")
        if (!node) return

        const onStart = (event: AnimationEvent) => {
          const target = event.composedPath?.()?.[0] ?? event.target
          if (target === node) {
            context.set("prevAnimationName", getAnimationName(refs.get("styles")))
          }
        }

        const onEnd = (event: AnimationEvent) => {
          const animationName = getAnimationName(refs.get("styles"))
          const target = getEventTarget(event)
          if (target === node && animationName === context.get("unmountAnimationName")) {
            send({ type: "UNMOUNT", src: "animationend" })
          }
        }

        node.addEventListener("animationstart", onStart)
        node.addEventListener("animationcancel", onEnd)
        node.addEventListener("animationend", onEnd)
        const cleanupStyles = setStyle(node, { animationFillMode: "forwards" })

        return () => {
          node.removeEventListener("animationstart", onStart)
          node.removeEventListener("animationcancel", onEnd)
          node.removeEventListener("animationend", onEnd)
          nextTick(() => cleanupStyles())
        }
      },
    },
  },
})

function getAnimationName(styles?: CSSStyleDeclaration | null) {
  return styles?.animationName || "none"
}
