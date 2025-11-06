import { createMachine } from "@zag-js/core"
import { addDomEvent, trackPointerMove } from "@zag-js/dom-query"
import type { Size } from "@zag-js/types"
import { callAll, clampValue, ensureProps, isEqual } from "@zag-js/utils"
import * as dom from "./scroll-area.dom"
import type { ScrollAreaSchema, ScrollbarHiddenState, ScrollRecord } from "./scroll-area.types"
import { getScrollOffset } from "./utils/scroll-offset"
import { getScrollSides } from "./utils/scroll-sides"
import { Timeout } from "./utils/timeout"

const MIN_THUMB_SIZE = 20
const SCROLL_TIMEOUT = 1000

export const machine = createMachine<ScrollAreaSchema>({
  props({ props }) {
    ensureProps(props, ["id"])
    return props
  },

  context({ bindable }) {
    return {
      scrollingX: bindable<boolean>(() => ({ defaultValue: false })),
      scrollingY: bindable<boolean>(() => ({ defaultValue: false })),
      hovering: bindable<boolean>(() => ({ defaultValue: false })),
      dragging: bindable<boolean>(() => ({ defaultValue: false })),
      touchModality: bindable<boolean>(() => ({ defaultValue: false })),
      atSides: bindable<ScrollRecord<boolean>>(() => ({
        defaultValue: { top: true, right: false, bottom: false, left: true },
      })),
      cornerSize: bindable<Size>(() => ({
        defaultValue: { width: 0, height: 0 },
      })),
      thumbSize: bindable<Size>(() => ({
        defaultValue: { width: 0, height: 0 },
      })),
      hiddenState: bindable<ScrollbarHiddenState>(() => ({
        defaultValue: {
          scrollbarYHidden: false,
          scrollbarXHidden: false,
          cornerHidden: false,
        },
        hash(a) {
          return `Y:${a.scrollbarYHidden} X:${a.scrollbarXHidden} C:${a.cornerHidden}`
        },
      })),
    }
  },

  refs() {
    return {
      orientation: "vertical",
      scrollPosition: { x: 0, y: 0 },
      scrollYTimeout: new Timeout(),
      scrollXTimeout: new Timeout(),
      scrollEndTimeout: new Timeout(),
      startX: 0,
      startY: 0,
      startScrollTop: 0,
      startScrollLeft: 0,
      programmaticScroll: true,
    }
  },

  initialState() {
    return "idle"
  },

  watch({ track, prop, context, send }) {
    track([() => prop("dir"), () => context.hash("hiddenState")], () => {
      send({ type: "thumb.measure" })
    })
  },

  effects: ["trackContentResize", "trackViewportVisibility", "trackWheelEvent"],

  entry: ["checkHovering"],

  exit: ["clearTimeouts"],

  on: {
    "thumb.measure": {
      actions: ["setThumbSize"],
    },
    "viewport.scroll": {
      actions: ["setThumbSize", "setScrolling", "setProgrammaticScroll"],
    },
    "root.pointerenter": {
      actions: ["setTouchModality", "setHovering"],
    },
    "root.pointerdown": {
      actions: ["setTouchModality"],
    },
    "root.pointerleave": {
      actions: ["clearHovering"],
    },
  },

  states: {
    idle: {
      on: {
        "scrollbar.pointerdown": {
          target: "dragging",
          actions: ["scrollToPointer", "startDragging"],
        },
        "thumb.pointerdown": {
          target: "dragging",
          actions: ["startDragging"],
        },
      },
    },

    dragging: {
      effects: ["trackPointerMove"],
      on: {
        "thumb.pointermove": {
          actions: ["setDraggingScroll"],
        },
        "scrollbar.pointerup": {
          target: "idle",
          actions: ["stopDragging"],
        },
        "thumb.pointerup": {
          target: "idle",
          actions: ["clearScrolling", "stopDragging"],
        },
      },
    },
  },

  implementations: {
    actions: {
      setTouchModality({ context, event }) {
        context.set("touchModality", event.pointerType === "touch")
      },
      setHovering({ context }) {
        context.set("hovering", true)
      },
      clearHovering({ context }) {
        context.set("hovering", false)
      },
      setProgrammaticScroll({ refs }) {
        const scrollEndTimeout = refs.get("scrollEndTimeout")
        scrollEndTimeout.start(100, () => {
          refs.set("programmaticScroll", true)
        })
      },
      clearScrolling({ context, event }) {
        context.set(event.orientation === "vertical" ? "scrollingY" : "scrollingX", false)
      },
      setThumbSize({ context, scope, prop }) {
        const viewportEl = dom.getViewportEl(scope)
        if (!viewportEl) return

        const scrollableContentHeight = viewportEl.scrollHeight
        const scrollableContentWidth = viewportEl.scrollWidth
        if (scrollableContentHeight === 0 || scrollableContentWidth === 0) return

        const scrollbarYEl = dom.getScrollbarYEl(scope)
        const scrollbarXEl = dom.getScrollbarXEl(scope)

        const thumbYEl = dom.getThumbYEl(scope)
        const thumbXEl = dom.getThumbXEl(scope)

        const viewportHeight = viewportEl.clientHeight
        const viewportWidth = viewportEl.clientWidth
        const scrollTop = viewportEl.scrollTop
        const scrollLeft = viewportEl.scrollLeft

        const scrollbarYHidden = viewportHeight >= scrollableContentHeight
        const scrollbarXHidden = viewportWidth >= scrollableContentWidth

        const ratioX = viewportWidth / scrollableContentWidth
        const ratioY = viewportHeight / scrollableContentHeight
        const nextWidth = scrollbarXHidden ? 0 : viewportWidth
        const nextHeight = scrollbarYHidden ? 0 : viewportHeight

        const scrollbarXOffset = getScrollOffset(scrollbarXEl, "padding", "x")
        const scrollbarYOffset = getScrollOffset(scrollbarYEl, "padding", "y")
        const thumbXOffset = getScrollOffset(thumbXEl, "margin", "x")
        const thumbYOffset = getScrollOffset(thumbYEl, "margin", "y")

        const idealNextWidth = nextWidth - scrollbarXOffset - thumbXOffset
        const idealNextHeight = nextHeight - scrollbarYOffset - thumbYOffset

        const maxNextWidth = scrollbarXEl ? Math.min(scrollbarXEl.offsetWidth, idealNextWidth) : idealNextWidth
        const maxNextHeight = scrollbarYEl ? Math.min(scrollbarYEl.offsetHeight, idealNextHeight) : idealNextHeight

        const clampedNextWidth = Math.max(MIN_THUMB_SIZE, maxNextWidth * ratioX)
        const clampedNextHeight = Math.max(MIN_THUMB_SIZE, maxNextHeight * ratioY)

        context.set("thumbSize", (prevSize) => {
          if (prevSize.height === clampedNextHeight && prevSize.width === clampedNextWidth) {
            return prevSize
          }
          return {
            width: clampedNextWidth,
            height: clampedNextHeight,
          }
        })

        if (scrollbarYEl && thumbYEl) {
          const maxThumbOffsetY = scrollbarYEl.offsetHeight - clampedNextHeight - scrollbarYOffset - thumbYOffset
          const scrollRatioY = scrollTop / (scrollableContentHeight - viewportHeight)

          // In Safari, don't allow it to go negative or too far as `scrollTop` considers the rubber
          // band effect.
          const thumbOffsetY = Math.min(maxThumbOffsetY, Math.max(0, scrollRatioY * maxThumbOffsetY))

          thumbYEl.style.transform = `translate3d(0,${thumbOffsetY}px,0)`
        }

        // Handle X (horizontal) scroll
        if (scrollbarXEl && thumbXEl) {
          const maxThumbOffsetX = scrollbarXEl.offsetWidth - clampedNextWidth - scrollbarXOffset - thumbXOffset
          const scrollRatioX = scrollLeft / (scrollableContentWidth - viewportWidth)

          // In Safari, don't allow it to go negative or too far as `scrollLeft` considers the rubber
          // band effect.
          const thumbOffsetX =
            prop("dir") === "rtl"
              ? clampValue(scrollRatioX * maxThumbOffsetX, -maxThumbOffsetX, 0)
              : clampValue(scrollRatioX * maxThumbOffsetX, 0, maxThumbOffsetX)

          thumbXEl.style.transform = `translate3d(${thumbOffsetX}px,0,0)`
        }

        const cornerEl = dom.getCornerEl(scope)
        if (cornerEl) {
          if (scrollbarXHidden || scrollbarYHidden) {
            context.set("cornerSize", { width: 0, height: 0 })
          } else if (!scrollbarXHidden && !scrollbarYHidden) {
            const width = scrollbarYEl?.offsetWidth || 0
            const height = scrollbarXEl?.offsetHeight || 0
            context.set("cornerSize", { width, height })
          }
        }

        context.set("hiddenState", (prevState) => {
          const cornerHidden = scrollbarYHidden || scrollbarXHidden

          if (
            prevState.scrollbarYHidden === scrollbarYHidden &&
            prevState.scrollbarXHidden === scrollbarXHidden &&
            prevState.cornerHidden === cornerHidden
          ) {
            return prevState
          }

          return {
            scrollbarYHidden,
            scrollbarXHidden,
            cornerHidden,
          }
        })

        context.set("atSides", (prev) => {
          const next = getScrollSides(viewportEl, prop("dir"))
          if (isEqual(prev, next)) return prev
          return next
        })
      },

      checkHovering({ scope, context }) {
        const viewportEl = dom.getViewportEl(scope)
        if (viewportEl?.matches(":hover")) {
          context.set("hovering", true)
        }
      },

      setScrolling({ event, refs, context, prop }) {
        const scrollPosition = {
          x: event.target.scrollLeft,
          y: event.target.scrollTop,
        }
        const scrollPositionRef = refs.get("scrollPosition")

        const offsetX = scrollPosition.x - scrollPositionRef.x
        const offsetY = scrollPosition.y - scrollPositionRef.y

        refs.set("scrollPosition", scrollPosition)

        context.set("atSides", (prev) => {
          const next = getScrollSides(event.target, prop("dir"))
          if (isEqual(prev, next)) return prev
          return next
        })

        if (offsetY !== 0) {
          context.set("scrollingY", true)
          refs.get("scrollYTimeout").start(SCROLL_TIMEOUT, () => {
            context.set("scrollingY", false)
          })
        }

        if (offsetX !== 0) {
          context.set("scrollingX", true)
          refs.get("scrollXTimeout").start(SCROLL_TIMEOUT, () => {
            context.set("scrollingX", false)
          })
        }
      },

      scrollToPointer({ event, scope, prop }) {
        const viewportEl = dom.getViewportEl(scope)
        if (!viewportEl) return

        const thumbYRef = dom.getThumbYEl(scope)
        const scrollbarYRef = dom.getScrollbarYEl(scope)
        const thumbXRef = dom.getThumbXEl(scope)
        const scrollbarXRef = dom.getScrollbarXEl(scope)

        const client = event.point

        // Handle Y-axis (vertical) scroll
        if (thumbYRef && scrollbarYRef && event.orientation === "vertical") {
          const thumbYOffset = getScrollOffset(thumbYRef, "margin", "y")
          const scrollbarYOffset = getScrollOffset(scrollbarYRef, "padding", "y")
          const thumbHeight = thumbYRef.offsetHeight
          const trackRectY = scrollbarYRef.getBoundingClientRect()
          const clickY = client.y - trackRectY.top - thumbHeight / 2 - scrollbarYOffset + thumbYOffset / 2

          const scrollableContentHeight = viewportEl.scrollHeight
          const viewportHeight = viewportEl.clientHeight

          const maxThumbOffsetY = scrollbarYRef.offsetHeight - thumbHeight - scrollbarYOffset - thumbYOffset
          const scrollRatioY = clickY / maxThumbOffsetY
          const newScrollTop = scrollRatioY * (scrollableContentHeight - viewportHeight)

          viewportEl.scrollTop = newScrollTop
        }

        if (thumbXRef && scrollbarXRef && event.orientation === "horizontal") {
          const thumbXOffset = getScrollOffset(thumbXRef, "margin", "x")
          const scrollbarXOffset = getScrollOffset(scrollbarXRef, "padding", "x")
          const thumbWidth = thumbXRef.offsetWidth
          const trackRectX = scrollbarXRef.getBoundingClientRect()
          const clickX = client.x - trackRectX.left - thumbWidth / 2 - scrollbarXOffset + thumbXOffset / 2

          const scrollableContentWidth = viewportEl.scrollWidth
          const viewportWidth = viewportEl.clientWidth

          const maxThumbOffsetX = scrollbarXRef.offsetWidth - thumbWidth - scrollbarXOffset - thumbXOffset
          const scrollRatioX = clickX / maxThumbOffsetX

          let newScrollLeft: number
          if (prop("dir") === "rtl") {
            // In RTL, invert the scroll direction
            newScrollLeft = (1 - scrollRatioX) * (scrollableContentWidth - viewportWidth)
            // Adjust for browsers that use negative scrollLeft in RTL
            if (viewportEl.scrollLeft <= 0) {
              newScrollLeft = -newScrollLeft
            }
          } else {
            newScrollLeft = scrollRatioX * (scrollableContentWidth - viewportWidth)
          }

          viewportEl.scrollLeft = newScrollLeft
        }
      },

      startDragging({ event, refs, scope }) {
        refs.set("startX", event.point.x)
        refs.set("startY", event.point.y)
        refs.set("orientation", event.orientation)

        const viewportEl = dom.getViewportEl(scope)
        if (!viewportEl) return

        refs.set("startScrollTop", viewportEl.scrollTop)
        refs.set("startScrollLeft", viewportEl.scrollLeft)
      },

      setDraggingScroll({ event, refs, scope, context }) {
        const startY = refs.get("startY")
        const startX = refs.get("startX")
        const startScrollTop = refs.get("startScrollTop")
        const startScrollLeft = refs.get("startScrollLeft")

        const client = event.point

        const deltaY = client.y - startY
        const deltaX = client.x - startX

        const viewportEl = dom.getViewportEl(scope)
        if (!viewportEl) return

        const scrollableContentHeight = viewportEl.scrollHeight
        const viewportHeight = viewportEl.clientHeight

        const scrollableContentWidth = viewportEl.scrollWidth
        const viewportWidth = viewportEl.clientWidth

        const orientation = refs.get("orientation")

        const thumbYEl = dom.getThumbYEl(scope)
        const scrollbarYEl = dom.getScrollbarYEl(scope)

        if (thumbYEl && scrollbarYEl && orientation === "vertical") {
          const scrollbarYOffset = getScrollOffset(scrollbarYEl, "padding", "y")
          const thumbYOffset = getScrollOffset(thumbYEl, "margin", "y")
          const thumbHeight = thumbYEl.offsetHeight
          const maxThumbOffsetY = scrollbarYEl.offsetHeight - thumbHeight - scrollbarYOffset - thumbYOffset
          const scrollRatioY = deltaY / maxThumbOffsetY
          viewportEl.scrollTop = startScrollTop + scrollRatioY * (scrollableContentHeight - viewportHeight)
          context.set("scrollingY", true)
          refs.get("scrollYTimeout").start(SCROLL_TIMEOUT, () => {
            context.set("scrollingY", false)
          })
        }
        const thumbXEl = dom.getThumbXEl(scope)
        const scrollbarXEl = dom.getScrollbarXEl(scope)
        if (thumbXEl && scrollbarXEl && orientation === "horizontal") {
          const scrollbarXOffset = getScrollOffset(scrollbarXEl, "padding", "x")
          const thumbXOffset = getScrollOffset(thumbXEl, "margin", "x")
          const thumbWidth = thumbXEl.offsetWidth
          const maxThumbOffsetX = scrollbarXEl.offsetWidth - thumbWidth - scrollbarXOffset - thumbXOffset
          const scrollRatioX = deltaX / maxThumbOffsetX
          viewportEl.scrollLeft = startScrollLeft + scrollRatioX * (scrollableContentWidth - viewportWidth)
          context.set("scrollingX", true)
          refs.get("scrollXTimeout").start(SCROLL_TIMEOUT, () => {
            context.set("scrollingX", false)
          })
        }
      },

      stopDragging({ refs }) {
        refs.set("orientation", null)
      },

      clearTimeouts({ refs }) {
        refs.get("scrollYTimeout").clear()
        refs.get("scrollXTimeout").clear()
        refs.get("scrollEndTimeout").clear()
      },
    },

    effects: {
      trackContentResize({ scope, send }) {
        const contentEl = dom.getContentEl(scope)
        const rootEl = dom.getRootEl(scope)

        if (!contentEl || !rootEl) return

        const win = scope.getWin()
        const obs = new win.ResizeObserver(() => {
          // Use a small timeout to ensure scroll events are processed before resize adjustments
          // This prevents conflicts between scroll events and resize observer events
          setTimeout(() => {
            send({ type: "thumb.measure" })
          }, 1)
        })

        obs.observe(contentEl)
        obs.observe(rootEl)

        return () => {
          obs.disconnect()
        }
      },

      trackViewportVisibility({ scope, send }) {
        const win = scope.getWin()
        const viewportEl = dom.getViewportEl(scope)
        if (!viewportEl) return
        const observer = new win.IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.intersectionRatio > 0) {
              send({ type: "thumb.measure" })
              observer.disconnect()
            }
          })
        })
        observer.observe(viewportEl)
        return () => {
          observer.disconnect()
        }
      },

      trackWheelEvent({ scope }) {
        const scrollbarYEl = dom.getScrollbarYEl(scope)
        const scrollbarXEl = dom.getScrollbarXEl(scope)
        if (!scrollbarYEl && !scrollbarXEl) return

        const onWheel = (event: WheelEvent) => {
          const viewportEl = dom.getViewportEl(scope)
          if (!viewportEl || event.ctrlKey) return

          const orientation = (event.currentTarget as HTMLElement).dataset.orientation as "vertical" | "horizontal"

          // Only preventDefault when the inner viewport will actually scroll.
          // If at boundaries, allow the event to bubble for nested scroll chaining.
          if (orientation === "vertical") {
            const canScrollY = viewportEl.scrollHeight > viewportEl.clientHeight
            const atTop = viewportEl.scrollTop === 0 && event.deltaY < 0
            const atBottom =
              viewportEl.scrollTop === viewportEl.scrollHeight - viewportEl.clientHeight && event.deltaY > 0
            const shouldScroll = canScrollY && event.deltaY !== 0 && !(atTop || atBottom)
            if (!shouldScroll) return
            event.preventDefault()
            viewportEl.scrollTop += event.deltaY
          } else if (orientation === "horizontal") {
            const canScrollX = viewportEl.scrollWidth > viewportEl.clientWidth
            const atLeft = viewportEl.scrollLeft === 0 && event.deltaX < 0
            const atRight =
              viewportEl.scrollLeft === viewportEl.scrollWidth - viewportEl.clientWidth && event.deltaX > 0
            const shouldScroll = canScrollX && event.deltaX !== 0 && !(atLeft || atRight)
            if (!shouldScroll) return
            event.preventDefault()
            viewportEl.scrollLeft += event.deltaX
          }
        }

        return callAll(
          scrollbarYEl && addDomEvent(scrollbarYEl, "wheel", onWheel, { passive: false }),
          scrollbarXEl && addDomEvent(scrollbarXEl, "wheel", onWheel, { passive: false }),
        )
      },

      trackPointerMove({ scope, send, refs }) {
        const doc = scope.getDoc()
        const orientation = refs.get("orientation")
        return trackPointerMove(doc, {
          onPointerMove({ point }) {
            send({ type: "thumb.pointermove", orientation, point })
          },
          onPointerUp() {
            send({ type: "thumb.pointerup", orientation })
          },
        })
      },
    },
  },
})
