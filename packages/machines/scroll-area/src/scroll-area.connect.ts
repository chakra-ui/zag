import { contains, dataAttr, getEventPoint, getEventTarget } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { toPx } from "@zag-js/utils"
import { parts } from "./scroll-area.anatomy"
import * as dom from "./scroll-area.dom"
import type {
  CornerState,
  RootState,
  ScrollAreaApi,
  ScrollAreaService,
  ScrollbarProps,
  ScrollbarState,
  ViewportState,
} from "./scroll-area.types"
import { getScrollProgress } from "./utils/scroll-progress"
import { scrollTo } from "./utils/scroll-to"
import { scrollToEdge } from "./utils/scroll-to-edge"

export function connect<T extends PropTypes>(
  service: ScrollAreaService,
  normalize: NormalizeProps<T>,
): ScrollAreaApi<T> {
  const { state, send, context, prop, scope, refs } = service

  const draggingOrientation = state.matches("dragging") ? refs.get("orientation") : null
  const hovering = context.get("hovering")

  const cornerSize = context.get("cornerSize")
  const thumbSize = context.get("thumbSize")
  const hiddenState = context.get("hiddenState")
  const atSides = context.get("atSides")

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getRootState(): RootState {
    return {
      hovering,
      overflowX: !hiddenState.scrollbarXHidden,
      overflowY: !hiddenState.scrollbarYHidden,
    }
  }

  function getViewportState(): ViewportState {
    return {
      ...getRootState(),
      atTop: atSides.top,
      atBottom: atSides.bottom,
      atLeft: atSides.left,
      atRight: atSides.right,
    }
  }

  function getScrollbarState(props: ScrollbarProps): ScrollbarState {
    const { orientation = "vertical" } = props
    const horizontal = orientation === "horizontal"
    return {
      ...getRootState(),
      dragging: draggingOrientation === orientation,
      scrolling: context.get(horizontal ? "scrollingX" : "scrollingY"),
      hidden: horizontal ? hiddenState.scrollbarXHidden : hiddenState.scrollbarYHidden,
    }
  }

  function getCornerState(): CornerState {
    return { ...getRootState(), hidden: hiddenState.cornerHidden }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

  return {
    isAtTop: atSides.top,
    isAtBottom: atSides.bottom,
    isAtLeft: atSides.left,
    isAtRight: atSides.right,
    hasOverflowX: !hiddenState.scrollbarXHidden,
    hasOverflowY: !hiddenState.scrollbarYHidden,
    getScrollProgress() {
      return getScrollProgress(dom.getViewportEl(scope), 0)
    },
    scrollToEdge(details) {
      const { edge, behavior } = details
      return scrollToEdge(dom.getViewportEl(scope), edge, prop("dir"), behavior)
    },
    scrollTo(details) {
      return scrollTo(dom.getViewportEl(scope), details)
    },
    getScrollbarState,

    getRootState,
    getRootProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.root.attrs(scope.id),
        dir: prop("dir"),
        role: "presentation",
        "data-overflow-x": dataAttr(rootState.overflowX),
        "data-overflow-y": dataAttr(rootState.overflowY),
        onPointerEnter(event) {
          const target = getEventTarget(event)
          if (!contains(event.currentTarget, target)) return
          send({ type: "root.pointerenter", pointerType: event.pointerType })
        },
        onPointerMove(event) {
          const target = getEventTarget(event)
          if (!contains(event.currentTarget, target)) return
          send({ type: "root.pointerenter", pointerType: event.pointerType })
        },
        onPointerDown({ pointerType }) {
          send({ type: "root.pointerdown", pointerType })
        },
        onPointerLeave(event) {
          if (contains(event.currentTarget, event.relatedTarget)) return
          send({ type: "root.pointerleave" })
        },
        style: {
          position: "relative",
          "--corner-width": toPx(cornerSize?.width),
          "--corner-height": toPx(cornerSize?.height),
          "--thumb-width": toPx(thumbSize?.width),
          "--thumb-height": toPx(thumbSize?.height),
        },
      })
    },

    getViewportState,
    getViewportProps() {
      const viewportState = getViewportState()
      const handleUserInteraction = () => {
        send({ type: "user.scroll" })
      }
      return normalize.element({
        ...parts.viewport.attrs(scope.id),
        "data-at-top": dataAttr(viewportState.atTop),
        "data-at-bottom": dataAttr(viewportState.atBottom),
        "data-at-left": dataAttr(viewportState.atLeft),
        "data-at-right": dataAttr(viewportState.atRight),
        "data-overflow-x": dataAttr(viewportState.overflowX),
        "data-overflow-y": dataAttr(viewportState.overflowY),
        tabIndex: viewportState.overflowX || viewportState.overflowY ? 0 : undefined,
        style: {
          overflow: "auto",
        },
        onScroll(event) {
          send({ type: "viewport.scroll", target: event.currentTarget })
        },
        onWheel: handleUserInteraction,
        onTouchMove: handleUserInteraction,
        onPointerMove: handleUserInteraction,
        onPointerEnter: handleUserInteraction,
        onKeyDown: handleUserInteraction,
      })
    },

    getContentProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.content.attrs(scope.id),
        role: "presentation",
        "data-overflow-x": dataAttr(rootState.overflowX),
        "data-overflow-y": dataAttr(rootState.overflowY),
        style: {
          minWidth: "fit-content",
        },
      })
    },

    getScrollbarProps(props = {}) {
      const { orientation = "vertical" } = props
      const scrollbarState = getScrollbarState(props)
      return normalize.element({
        ...parts.scrollbar.attrs(scope.id),
        "aria-hidden": true,
        "data-orientation": orientation,
        "data-scrolling": dataAttr(scrollbarState.scrolling),
        "data-hover": dataAttr(scrollbarState.hovering),
        "data-dragging": dataAttr(scrollbarState.dragging),
        "data-overflow-x": dataAttr(scrollbarState.overflowX),
        "data-overflow-y": dataAttr(scrollbarState.overflowY),
        onPointerUp() {
          send({ type: "scrollbar.pointerup", orientation })
        },
        onMouseDown(event) {
          event.preventDefault()
        },
        onPointerDown(event) {
          if (event.button !== 0) {
            return
          }
          if (event.currentTarget !== event.target) {
            return
          }
          const point = getEventPoint(event)
          send({ type: "scrollbar.pointerdown", orientation, point })
          event.stopPropagation()
        },
        style: {
          position: "absolute",
          touchAction: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
          ...(orientation === "vertical" && {
            top: 0,
            bottom: `var(--corner-height)`,
            insetInlineEnd: 0,
          }),
          ...(orientation === "horizontal" && {
            insetInlineStart: 0,
            insetInlineEnd: `var(--corner-width)`,
            bottom: 0,
          }),
        },
      })
    },

    getThumbProps(props = {}) {
      const { orientation = "vertical" } = props
      const scrollbarState = getScrollbarState(props)
      return normalize.element({
        ...parts.thumb.attrs(scope.id),
        "data-orientation": orientation,
        "data-hover": dataAttr(scrollbarState.hovering),
        "data-dragging": dataAttr(scrollbarState.dragging),
        onPointerDown(event) {
          if (event.button !== 0) return
          const point = getEventPoint(event)
          send({ type: "thumb.pointerdown", orientation, point })
        },
        style: {
          ...(orientation === "vertical" && {
            height: "var(--thumb-height)",
          }),
          ...(orientation === "horizontal" && {
            width: "var(--thumb-width)",
          }),
        },
      })
    },

    getCornerState,
    getCornerProps() {
      const cornerState = getCornerState()
      return normalize.element({
        ...parts.corner.attrs(scope.id),
        "aria-hidden": true,
        "data-hover": dataAttr(cornerState.hovering),
        "data-state": cornerState.hidden ? "hidden" : "visible",
        "data-overflow-x": dataAttr(cornerState.overflowX),
        "data-overflow-y": dataAttr(cornerState.overflowY),
        style: {
          position: "absolute",
          bottom: 0,
          insetInlineEnd: 0,
          width: "var(--corner-width)",
          height: "var(--corner-height)",
        },
      })
    },
  }
}
