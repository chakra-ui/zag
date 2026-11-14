import { createMachine } from "@zag-js/core"
import {
  AnimationFrame,
  getComputedStyle,
  getEventTarget,
  getWindow,
  nextTick,
  raf,
  setStyle,
  Timeout,
} from "@zag-js/dom-query"
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
      unmountFrame: AnimationFrame.create(),
      prevAnimationFrame: AnimationFrame.create(),
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

  exit: ["cancelFrames", "cleanupNode"],

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
      effects: ["trackEnterAnimation"],
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
      effects: ["trackExitAnimation"],
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

      invokeOnExitComplete: ({ prop, refs }) => {
        prop("onExitComplete")?.()

        // Emit exitcomplete event on the node
        const node = refs.get("node")
        if (!node) return

        const win = getWindow(node)
        const event = new win.CustomEvent("exitcomplete", { bubbles: false })
        node.dispatchEvent(event)
      },

      setupNode: ({ refs, event }) => {
        // skip if same node
        if (refs.get("node") === event.node) return
        refs.set("node", event.node)
        refs.set("styles", getComputedStyle(event.node))
      },

      cancelFrames: ({ refs }) => {
        refs.get("unmountFrame").cancel()
        refs.get("prevAnimationFrame").cancel()
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

        refs.get("unmountFrame").request(() => {
          // Re-check present prop - it may have changed back to true during the raf delay
          if (prop("present")) return

          const animationName = getAnimationName(refs.get("styles"))
          context.set("unmountAnimationName", animationName)
          if (
            animationName === "none" ||
            animationName === context.get("prevAnimationName") ||
            refs.get("styles")?.display === "none" ||
            refs.get("styles")?.animationDuration === "0s" ||
            !hasRunningAnimation(refs.get("node"), animationName)
          ) {
            send({ type: "UNMOUNT", src: "presence.changed" })
          } else {
            send({ type: "UNMOUNT.SUSPEND" })
          }
        })
      },

      setPrevAnimationName: ({ context, refs }) => {
        refs.get("prevAnimationFrame").request(() => {
          context.set("prevAnimationName", getAnimationName(refs.get("styles")))
        })
      },

      clearPrevAnimationName: ({ context }) => {
        context.set("prevAnimationName", null)
      },
    },

    effects: {
      trackEnterAnimation: ({ context, refs, prop }) => {
        // skip initial mount (present on first render)
        if (!prop("onEnterComplete") || !context.get("initial")) return

        let cancel: VoidFunction | undefined

        const track = () => {
          cancel = raf(() => {
            const node = refs.get("node")

            // node may not be registered yet; retry next frame
            if (!node || !node.isConnected) {
              track()
              return
            }

            const styles = getComputedStyle(node)
            const animationName = getAnimationName(styles)

            if (animationName === "none" || styles.display === "none" || styles.animationDuration === "0s") {
              prop("onEnterComplete")?.()
              return
            }

            const onEnd = (event: AnimationEvent) => {
              const target = getEventTarget(event)
              if (target !== node || !prop("present")) return
              node.removeEventListener("animationend", onEnd)
              prop("onEnterComplete")?.()
            }

            node.addEventListener("animationend", onEnd)
            return () => {
              node.removeEventListener("animationend", onEnd)
            }
          })
        }

        track()

        return () => cancel?.()
      },

      trackExitAnimation: ({ context, refs, send, prop }) => {
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

        const onCancel = (event: AnimationEvent) => {
          const target = getEventTarget(event)
          if (target === node && !prop("present")) {
            send({ type: "UNMOUNT", src: "animationcancel" })
          }
        }

        node.addEventListener("animationstart", onStart)
        node.addEventListener("animationcancel", onCancel)
        node.addEventListener("animationend", onEnd)
        const cleanupStyles = setStyle(node, { animationFillMode: "forwards" })

        // `animationend` can be missed (detached node, a style swap), so unmount once the exit should be over
        const exitTimeout = Timeout.create()
        const duration = getExitDuration(refs.get("styles"))
        if (duration != null) exitTimeout.start(duration, () => send({ type: "UNMOUNT", src: "timeout" }))

        return () => {
          exitTimeout.cancel()
          node.removeEventListener("animationstart", onStart)
          node.removeEventListener("animationcancel", onCancel)
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

function hasRunningAnimation(node: HTMLElement | null, animationName: string) {
  // assume it is running where the Web Animations API is unavailable
  if (!node || typeof node.getAnimations !== "function") return true
  const names = animationName.split(",").map((name) => name.trim())
  return node.getAnimations().some((animation) => {
    const name = (animation as CSSAnimation).animationName
    return animation.playState === "running" && (name == null || names.includes(name))
  })
}

const EXIT_BUFFER_MS = 50

/** The longest exit animation in ms. An infinite one counts once, since it never ends */
function getExitDuration(styles?: CSSStyleDeclaration | null) {
  if (!styles) return
  const durations = parseTimes(styles.animationDuration)
  const delays = parseTimes(styles.animationDelay)
  const counts = (styles.animationIterationCount || "1").split(",").map((v) => Number.parseFloat(v) || 1)

  let max = 0
  for (let i = 0; i < durations.length; i++) {
    const total = (delays[i % delays.length] ?? 0) + durations[i] * counts[i % counts.length]
    max = Math.max(max, total)
  }
  return max + EXIT_BUFFER_MS
}

function parseTimes(value: string | undefined) {
  if (!value) return [0]
  return value.split(",").map((v) => {
    const n = Number.parseFloat(v)
    if (Number.isNaN(n)) return 0
    return v.trim().endsWith("ms") ? n : n * 1000
  })
}
