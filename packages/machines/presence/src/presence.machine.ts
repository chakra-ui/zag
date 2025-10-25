import { getComputedStyle, getEventTarget, nextTick, raf, setStyle } from "@zag-js/dom-query"
import { createMachine } from "@zag-js/core"
import type { PresenceSchema } from "./presence.types"

export const machine = createMachine<PresenceSchema>({
  props({ props }) {
    return { ...props, present: !!props.present }
  },

  initialState({ prop }) {
    return prop("present") ? "mounted" : "unmounted"
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
      initial: bindable<boolean>(() => ({
        sync: true,
        defaultValue: false,
      })),
    }
  },

  exit: ["clearInitial", "cleanupNode"],

  watch({ track, prop, send }) {
    track([() => prop("present")], () => {
      send({ type: "PRESENCE.CHANGED" })
    })
  },

  on: {
    "NODE.SET": {
      actions: ["setupNode"],
    },
    "PRESENCE.CHANGED": {
      actions: ["setInitial", "syncPresence"],
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
        if (context.get("initial")) return
        queueMicrotask(() => {
          context.set("initial", true)
        })
      },

      clearInitial: ({ context }) => {
        context.set("initial", false)
      },

      invokeOnExitComplete: ({ prop }) => {
        prop("onExitComplete")?.()
      },

      setupNode: ({ refs, event }) => {
        // skip if same node
        if (refs.get("node") === event.node) return
        refs.set("node", event.node)
        refs.set("styles", getComputedStyle(event.node))
      },

      cleanupNode: ({ refs }) => {
        refs.set("node", null)
        refs.set("styles", null)
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
      trackAnimationEvents: ({ context, refs, send, prop }) => {
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
          if (target === node && animationName === context.get("unmountAnimationName") && !prop("present")) {
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
