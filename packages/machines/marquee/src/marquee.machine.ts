import { createMachine } from "@zag-js/core"
import { dom } from "./marquee.dom"
import type { MarqueeSchema } from "./marquee.types"

export const machine = createMachine<MarqueeSchema>({
  props({ props }) {
    return {
      dir: "ltr",
      side: "start",
      speed: 50,
      delay: 0,
      loopCount: 0,
      spacing: "1rem",
      autoFill: false,
      pauseOnInteraction: false,
      reverse: false,
      defaultPaused: false,
      translations: {
        root: "Marquee content",
      },
      ...props,
    }
  },

  refs() {
    return {
      dimensions: undefined,
      initialDurationSet: false,
    }
  },

  context({ prop, bindable }) {
    return {
      paused: bindable<boolean>(() => ({
        value: prop("paused"),
        defaultValue: prop("defaultPaused"),
        onChange(value) {
          prop("onPauseChange")?.({ paused: value })
        },
      })),
      duration: bindable<number>(() => ({
        defaultValue: 2000 / Math.max(0.001, prop("speed")),
      })),
    }
  },

  initialState() {
    return "idle"
  },

  computed: {
    orientation: ({ prop }) => {
      const side = prop("side")
      return side === "top" || side === "bottom" ? "vertical" : "horizontal"
    },
    isVertical: ({ prop }) => {
      const side = prop("side")
      return side === "top" || side === "bottom"
    },
    multiplier: ({ refs, prop }) => {
      if (!prop("autoFill")) return 1
      const dimensions = refs.get("dimensions")
      if (!dimensions) return 1

      const { rootSize, contentSize } = dimensions
      if (contentSize === 0) return 1

      return contentSize < rootSize ? Math.ceil(rootSize / contentSize) : 1
    },
  },

  on: {
    PAUSE: {
      actions: ["setPaused"],
    },
    RESUME: {
      actions: ["setResumed"],
    },
    TOGGLE_PAUSE: {
      actions: ["togglePaused"],
    },
    RESTART: {
      actions: ["restartAnimation"],
    },
  },

  effects: ["trackDimensions"],

  states: {
    idle: {},
  },

  implementations: {
    actions: {
      setPaused({ context }) {
        context.set("paused", true)
      },
      setResumed({ context }) {
        context.set("paused", false)
      },
      togglePaused({ context }) {
        context.set("paused", (prev) => !prev)
      },
      restartAnimation({ scope }) {
        const viewportEl = dom.getViewportEl(scope)
        if (!viewportEl) return

        // Query all content elements (original + clones)
        const contentElements = viewportEl.querySelectorAll<HTMLDivElement>('[data-part="content"]')

        contentElements.forEach((el) => {
          // Remove animation
          el.style.animation = "none"
          // Force reflow
          el.offsetHeight
          // Restore animation (browser applies CSS rules)
          el.style.animation = ""
        })
      },
    },

    effects: {
      trackDimensions({ scope, refs, computed, context, prop }) {
        const rootEl = dom.getRootEl(scope)
        const contentEl = dom.getContentEl(scope, 0)
        if (!rootEl || !contentEl) return

        const win = scope.getWin()

        // Helper to measure dimensions
        const measureDimensions = () => {
          const rootSize = computed("isVertical") ? rootEl.clientHeight : rootEl.clientWidth
          const contentSize = computed("isVertical") ? contentEl.clientHeight : contentEl.clientWidth
          return { rootSize, contentSize }
        }

        const exec = () => {
          if (refs.get("initialDurationSet")) return

          const { rootSize, contentSize } = measureDimensions()

          if (rootSize > 0 && contentSize > 0) {
            refs.set("dimensions", { rootSize, contentSize })

            // Calculate duration only once
            const speed = Math.max(0.001, prop("speed"))
            const multiplier = computed("multiplier")

            const calculatedDuration = prop("autoFill")
              ? (contentSize * multiplier) / speed
              : contentSize < rootSize
                ? rootSize / speed
                : contentSize / speed

            context.set("duration", calculatedDuration)
            refs.set("initialDurationSet", true)
          }
        }

        // Use RAF to throttle resize updates
        let rafId: number | null = null
        const observer = new win.ResizeObserver(() => {
          if (rafId !== null) return
          rafId = win.requestAnimationFrame(() => {
            const { rootSize, contentSize } = measureDimensions()
            refs.set("dimensions", { rootSize, contentSize })
            rafId = null
          })
        })

        observer.observe(rootEl)
        observer.observe(contentEl)

        // Initial measurement
        exec()

        return () => {
          observer.disconnect()
          if (rafId !== null) win.cancelAnimationFrame(rafId)
        }
      },
    },
  },
})
