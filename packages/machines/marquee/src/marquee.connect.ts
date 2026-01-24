import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./marquee.anatomy"
import { dom } from "./marquee.dom"
import type { MarqueeApi, MarqueeService } from "./marquee.types"
import { getEdgePositionStyles, getMarqueeTranslate } from "./marquee.utils"

export function connect<T extends PropTypes>(service: MarqueeService, normalize: NormalizeProps<T>): MarqueeApi<T> {
  const { scope, send, context, computed, prop } = service

  const side = prop("side")

  const paused = context.get("paused")
  const duration = context.get("duration")

  const orientation = computed("orientation")
  const multiplier = computed("multiplier")
  const isVertical = computed("isVertical")

  return {
    paused,
    orientation,
    side,
    multiplier,
    contentCount: multiplier + 1,

    pause() {
      send({ type: "PAUSE" })
    },

    resume() {
      send({ type: "RESUME" })
    },

    togglePause() {
      send({ type: "TOGGLE_PAUSE" })
    },

    restart() {
      send({ type: "RESTART" })
    },

    getRootProps() {
      const dir = prop("dir")

      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        dir,
        role: "region",
        "aria-roledescription": "marquee",
        "aria-live": "off",
        "aria-label": prop("translations").root,
        "data-state": paused ? "paused" : "idle",
        "data-orientation": orientation,
        "data-paused": dataAttr(paused),
        onMouseEnter: prop("pauseOnInteraction") ? () => send({ type: "PAUSE" }) : undefined,
        onMouseLeave: prop("pauseOnInteraction") ? () => send({ type: "RESUME" }) : undefined,
        onFocusCapture: prop("pauseOnInteraction")
          ? (event) => {
              // Pause when any child receives focus (prevents disorienting moving focus)
              if (event.target !== event.currentTarget) {
                send({ type: "PAUSE" })
              }
            }
          : undefined,
        onBlurCapture: prop("pauseOnInteraction")
          ? (event) => {
              // Resume only when focus leaves marquee entirely
              if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                send({ type: "RESUME" })
              }
            }
          : undefined,
        style: {
          display: "flex",
          flexDirection: orientation === "vertical" ? "column" : "row",
          position: "relative",
          // Essential for clipping scrolling content
          overflow: "hidden",
          // CSS containment for performance - prevents layout recalculation of parent elements
          contain: "layout style paint",
          "--marquee-duration": `${duration}s`,
          "--marquee-spacing": prop("spacing"),
          "--marquee-delay": `${prop("delay")}s`,
          "--marquee-loop-count": prop("loopCount") === 0 ? "infinite" : prop("loopCount").toString(),
          "--marquee-translate": getMarqueeTranslate({ side, dir }),
        },
      })
    },

    getViewportProps() {
      return normalize.element({
        ...parts.viewport.attrs,
        id: dom.getViewportId(scope),
        "data-part": "viewport",
        "data-orientation": orientation,
        "data-side": side,
        onAnimationIteration(event) {
          // Only fire for first content element (not clones)
          if (event.target === dom.getContentEl(scope, 0)) {
            prop("onLoopComplete")?.()
          }
        },
        onAnimationEnd(event) {
          // Only fire for first content element (not clones)
          if (event.target === dom.getContentEl(scope, 0)) {
            prop("onComplete")?.()
          }
        },
        style: {
          display: "flex",
          [isVertical ? "height" : "width"]: "100%",
          // For bottom/end sides, reverse flex direction so clones appear on the correct side
          flexDirection:
            orientation === "vertical"
              ? side === "bottom"
                ? "column-reverse"
                : "column"
              : side === "end"
                ? "row-reverse"
                : "row",
        },
      })
    },

    getContentProps(props) {
      const { index } = props
      const clone = index > 0
      return normalize.element({
        ...parts.content.attrs,
        id: dom.getContentId(scope, index),
        dir: prop("dir"),
        "data-part": "content",
        "data-index": index,
        "data-orientation": orientation,
        "data-side": side,
        "data-reverse": prop("reverse") ? "" : undefined,
        "data-clone": dataAttr(clone),
        role: clone ? "presentation" : undefined,
        "aria-hidden": clone ? true : undefined,
        style: {
          // Essential layout for marquee content
          display: "flex",
          flexDirection: orientation === "vertical" ? "column" : "row",
          flexShrink: 0,
          // Force compositor layer to prevent flicker during animation reset
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          willChange: paused ? "auto" : "transform",
          transform: "translateZ(0)",
          [isVertical ? "minWidth" : "minHeight"]: "auto",
          // Prevent subpixel rendering issues that cause flicker in Firefox
          contain: "paint",
        },
      })
    },

    getEdgeProps(props) {
      const { side } = props
      const dir = prop("dir")

      return normalize.element({
        ...parts.edge.attrs,
        dir,
        "data-part": "edge",
        "data-side": side,
        "data-orientation": orientation,
        style: {
          pointerEvents: "none",
          position: "absolute",
          ...getEdgePositionStyles({ side, dir }),
        },
      })
    },

    getItemProps() {
      return normalize.element({
        ...parts.item.attrs,
        dir: prop("dir"),
        style: {
          [isVertical ? "marginBlock" : "marginInline"]: "calc(var(--marquee-spacing) / 2)",
        },
      })
    },
  }
}
