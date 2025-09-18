import { contains, dataAttr, getEventPoint, getEventTarget } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { toPx } from "@zag-js/utils"
import { parts } from "./scroll-area.anatomy"
import * as dom from "./scroll-area.dom"
import type { ScrollAreaApi, ScrollAreaService } from "./scroll-area.types"
import { getScrollProgress } from "./utils/scroll-progress"
import { scrollTo } from "./utils/scroll-to"
import { scrollToEdge } from "./utils/scroll-to-edge"

export function connect<T extends PropTypes>(
  service: ScrollAreaService,
  normalize: NormalizeProps<T>,
): ScrollAreaApi<T> {
  const { state, send, context, prop, scope } = service

  const dragging = state.matches("dragging")
  const hovering = context.get("hovering")

  const cornerSize = context.get("cornerSize")
  const thumbSize = context.get("thumbSize")
  const hiddenState = context.get("hiddenState")
  const atSides = context.get("atSides")

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
    getScrollbarState(props) {
      const horizontal = props.orientation === "horizontal"
      return {
        hovering,
        dragging,
        scrolling: context.get(horizontal ? "scrollingX" : "scrollingY"),
        hidden: horizontal ? hiddenState.scrollbarXHidden : hiddenState.scrollbarYHidden,
      }
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        dir: prop("dir"),
        role: "presentation",
        "data-overflow-x": dataAttr(!hiddenState.scrollbarXHidden),
        "data-overflow-y": dataAttr(!hiddenState.scrollbarYHidden),
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

    getViewportProps() {
      const handleUserInteraction = () => {
        send({ type: "user.scroll" })
      }
      return normalize.element({
        ...parts.viewport.attrs,
        role: "presentation",
        "data-ownedby": dom.getRootId(scope),
        id: dom.getViewportId(scope),
        "data-at-top": dataAttr(atSides.top),
        "data-at-bottom": dataAttr(atSides.bottom),
        "data-at-left": dataAttr(atSides.left),
        "data-at-right": dataAttr(atSides.right),
        "data-overflow-x": dataAttr(!hiddenState.scrollbarXHidden),
        "data-overflow-y": dataAttr(!hiddenState.scrollbarYHidden),
        tabIndex: hiddenState.scrollbarXHidden || hiddenState.scrollbarYHidden ? undefined : 0,
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
      return normalize.element({
        ...parts.content.attrs,
        id: dom.getContentId(scope),
        role: "presentation",
        "data-overflow-x": dataAttr(!hiddenState.scrollbarXHidden),
        "data-overflow-y": dataAttr(!hiddenState.scrollbarYHidden),
        style: {
          minWidth: "fit-content",
        },
      })
    },

    getScrollbarProps(props = {}) {
      const { orientation = "vertical" } = props
      return normalize.element({
        ...parts.scrollbar.attrs,
        "data-ownedby": dom.getRootId(scope),
        "data-orientation": orientation,
        "data-scrolling": dataAttr(context.get(orientation === "horizontal" ? "scrollingX" : "scrollingY")),
        "data-hover": dataAttr(hovering),
        "data-dragging": dataAttr(dragging),
        "data-overflow-x": dataAttr(!hiddenState.scrollbarXHidden),
        "data-overflow-y": dataAttr(!hiddenState.scrollbarYHidden),
        onPointerUp() {
          send({ type: "scrollbar.pointerup", orientation })
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
      return normalize.element({
        ...parts.thumb.attrs,
        "data-ownedby": dom.getRootId(scope),
        "data-orientation": orientation,
        "data-hover": dataAttr(hovering),
        "data-dragging": dataAttr(dragging),
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

    getCornerProps() {
      return normalize.element({
        ...parts.corner.attrs,
        "data-ownedby": dom.getRootId(scope),
        "data-hover": dataAttr(hovering),
        "data-state": hiddenState.cornerHidden ? "hidden" : "visible",
        "data-overflow-x": dataAttr(!hiddenState.scrollbarXHidden),
        "data-overflow-y": dataAttr(!hiddenState.scrollbarYHidden),
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
