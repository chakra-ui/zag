import { dataAttr, getEventPoint } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { toPx } from "@zag-js/utils"
import { parts } from "./scroll-view.anatomy"
import * as dom from "./scroll-view.dom"
import type { ScrollViewApi, ScrollViewService } from "./scroll-view.types"
import { scrollTo } from "./utils/scroll-to"
import { scrollToEdge } from "./utils/scroll-to-edge"

export function connect<T extends PropTypes>(
  service: ScrollViewService,
  normalize: NormalizeProps<T>,
): ScrollViewApi<T> {
  const { send, context, prop, scope } = service

  const cornerSize = context.get("cornerSize")
  const thumbSize = context.get("thumbSize")
  const hiddenState = context.get("hiddenState")
  const atSides = context.get("atSides")

  return {
    isAtTop: atSides.top,
    isAtBottom: atSides.bottom,
    isAtLeft: atSides.left,
    isAtRight: atSides.right,
    scrollToEdge(details) {
      const { edge, ...easingOptions } = details
      return scrollToEdge(dom.getViewportEl(scope), edge, prop("dir"), easingOptions)
    },
    scrollTo(details) {
      return scrollTo(dom.getViewportEl(scope), details)
    },
    getScrollbarState(props) {
      return {
        hovering: context.get("hovering"),
        scrolling: context.get(props.orientation === "horizontal" ? "scrollingX" : "scrollingY"),
        hidden: props.orientation === "horizontal" ? hiddenState.scrollbarXHidden : hiddenState.scrollbarYHidden,
      }
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        dir: prop("dir"),
        role: "presentation",
        onPointerEnter(event) {
          send({ type: "root.pointerenter", pointerType: event.pointerType })
        },
        onPointerMove(event) {
          send({ type: "root.pointerenter", pointerType: event.pointerType })
        },
        onPointerDown({ pointerType }) {
          send({ type: "root.pointerdown", pointerType })
        },
        onPointerLeave() {
          send({ type: "root.pointerleave" })
        },
        style: {
          position: "relative",
          "--corder-width": toPx(cornerSize?.width),
          "--corder-height": toPx(cornerSize?.height),
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
        id: dom.getViewportId(scope),
        "data-at-top": dataAttr(atSides.top),
        "data-at-bottom": dataAttr(atSides.bottom),
        "data-at-left": dataAttr(atSides.left),
        "data-at-right": dataAttr(atSides.right),
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
        style: {
          minWidth: "fit-content",
        },
      })
    },

    getScrollbarProps(props = {}) {
      const { orientation = "vertical" } = props
      return normalize.element({
        ...parts.scrollbar.attrs,
        "data-orientation": orientation,
        "data-scrolling": dataAttr(context.get(orientation === "horizontal" ? "scrollingX" : "scrollingY")),
        "data-hovering": dataAttr(context.get("hovering")),
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
            bottom: `var(--corder-height)`,
            insetInlineEnd: 0,
          }),
          ...(orientation === "horizontal" && {
            insetInlineStart: 0,
            insetInlineEnd: `var(--corder-width)`,
            bottom: 0,
          }),
        },
      })
    },

    getThumbProps(props = {}) {
      const { orientation = "vertical" } = props
      return normalize.element({
        ...parts.thumb.attrs,
        "data-orientation": orientation,
        onPointerDown(event) {
          if (event.button !== 0) return
          const point = getEventPoint(event)
          send({ type: "thumb.pointerdown", orientation, point })
        },
        style: {
          width: "var(--thumb-width)",
          height: "var(--thumb-height)",
        },
      })
    },

    getCornerProps() {
      return normalize.element({
        ...parts.corner.attrs,
        "data-state": hiddenState.cornerHidden ? "hidden" : "visible",
        style: {
          position: "absolute",
          bottom: 0,
          insetInlineEnd: 0,
          width: "var(--corder-width)",
          height: "var(--corder-height)",
        },
      })
    },
  }
}
