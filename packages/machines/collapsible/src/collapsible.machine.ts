import { createMachine } from "@zag-js/core"
import { getComputedStyle, getEventTarget, nextTick, raf, setStyle } from "@zag-js/dom-query"
import * as dom from "./collapsible.dom"
import type { CollapsibleSchema } from "./collapsible.types"

export const machine = createMachine<CollapsibleSchema>({
  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen")
    return open ? "open" : "closed"
  },

  context({ bindable }) {
    return {
      size: bindable(() => ({
        defaultValue: { height: 0, width: 0 },
        sync: true,
      })),
      initial: bindable(() => ({
        defaultValue: false,
      })),
    }
  },

  refs() {
    return {
      cleanup: undefined,
      stylesRef: undefined,
    }
  },

  watch({ track, prop, action }) {
    track([() => prop("open")], () => {
      action(["setInitial", "computeSize", "toggleVisibility"])
    })
  },

  exit: ["clearInitial", "cleanupNode"],

  states: {
    closed: {
      on: {
        "controlled.open": {
          target: "open",
        },
        open: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setInitial", "computeSize", "invokeOnOpen"],
          },
        ],
      },
    },

    closing: {
      effects: ["trackExitAnimation"],
      on: {
        "controlled.close": {
          target: "closed",
        },
        "controlled.open": {
          target: "open",
        },
        open: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setInitial", "invokeOnOpen"],
          },
        ],
        close: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnExitComplete"],
          },
          {
            target: "closed",
            actions: ["setInitial", "computeSize", "invokeOnExitComplete"],
          },
        ],
        "animation.end": {
          target: "closed",
          actions: ["invokeOnExitComplete", "clearInitial"],
        },
      },
    },

    open: {
      effects: ["trackEnterAnimation"],
      on: {
        "controlled.close": {
          target: "closing",
        },
        close: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closing",
            actions: ["setInitial", "computeSize", "invokeOnClose"],
          },
        ],
        "size.measure": {
          actions: ["measureSize"],
        },
        "animation.end": {
          actions: ["clearInitial"],
        },
      },
    },
  },

  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop("open") != undefined,
    },

    effects: {
      trackEnterAnimation: ({ send, scope }) => {
        let cleanup: VoidFunction | undefined

        const rafCleanup = raf(() => {
          const contentEl = dom.getContentEl(scope)
          if (!contentEl) return

          // if there's no animation, send ANIMATION.END immediately
          const animationName = getComputedStyle(contentEl).animationName
          const hasNoAnimation = !animationName || animationName === "none"

          if (hasNoAnimation) {
            send({ type: "animation.end" })
            return
          }

          const onEnd = (event: AnimationEvent) => {
            const target = getEventTarget<Element>(event)
            if (target === contentEl) {
              send({ type: "animation.end" })
            }
          }

          contentEl.addEventListener("animationend", onEnd)

          cleanup = () => {
            contentEl.removeEventListener("animationend", onEnd)
          }
        })

        return () => {
          rafCleanup()
          cleanup?.()
        }
      },

      trackExitAnimation: ({ send, scope }) => {
        let cleanup: VoidFunction | undefined

        const rafCleanup = raf(() => {
          const contentEl = dom.getContentEl(scope)
          if (!contentEl) return

          // if there's no animation, send ANIMATION.END immediately
          const animationName = getComputedStyle(contentEl).animationName
          const hasNoAnimation = !animationName || animationName === "none"

          if (hasNoAnimation) {
            send({ type: "animation.end" })
            return
          }

          const onEnd = (event: AnimationEvent) => {
            const target = getEventTarget<Element>(event)
            if (target === contentEl) {
              send({ type: "animation.end" })
            }
          }

          contentEl.addEventListener("animationend", onEnd)
          const restoreStyles = setStyle(contentEl, {
            animationFillMode: "forwards",
          })
          cleanup = () => {
            contentEl.removeEventListener("animationend", onEnd)
            nextTick(() => restoreStyles())
          }
        })

        return () => {
          rafCleanup()
          cleanup?.()
        }
      },
    },

    actions: {
      setInitial: ({ context, flush }) => {
        flush(() => {
          context.set("initial", true)
        })
      },

      clearInitial: ({ context }) => {
        context.set("initial", false)
      },

      cleanupNode: ({ refs }) => {
        refs.set("stylesRef", null)
      },

      measureSize: ({ context, scope }) => {
        const contentEl = dom.getContentEl(scope)
        if (!contentEl) return
        const { height, width } = contentEl.getBoundingClientRect()
        context.set("size", { height, width })
      },

      computeSize: ({ refs, scope, context }) => {
        refs.get("cleanup")?.()

        const rafCleanup = raf(() => {
          const contentEl = dom.getContentEl(scope)
          if (!contentEl) return

          const hidden = contentEl.hidden

          // block any animations/transitions so the element renders at its full dimensions
          contentEl.style.animationName = "none"
          contentEl.style.animationDuration = "0s"
          contentEl.hidden = false

          const rect = contentEl.getBoundingClientRect()

          context.set("size", { height: rect.height, width: rect.width })

          // kick off any animations/transitions that were originally set up if it isn't the initial mount
          if (context.get("initial")) {
            contentEl.style.animationName = ""
            contentEl.style.animationDuration = ""
          }
          contentEl.hidden = hidden
        })

        refs.set("cleanup", rafCleanup)
      },

      invokeOnOpen: ({ prop }) => {
        prop("onOpenChange")?.({ open: true })
      },

      invokeOnClose: ({ prop }) => {
        prop("onOpenChange")?.({ open: false })
      },

      invokeOnExitComplete: ({ prop }) => {
        prop("onExitComplete")?.()
      },

      toggleVisibility: ({ prop, send }) => {
        send({ type: prop("open") ? "controlled.open" : "controlled.close" })
      },
    },
  },
})
