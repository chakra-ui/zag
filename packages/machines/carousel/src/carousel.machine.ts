import { createMachine } from "@zag-js/core"
import { addDomEvent, trackPointerMove } from "@zag-js/dom-event"
import { raf } from "@zag-js/dom-query"
import { getScrollSnapPositions } from "@zag-js/scroll-snap"
import { compact, isEqual, nextIndex, prevIndex } from "@zag-js/utils"
import { dom } from "./carousel.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./carousel.types"
import { clamp, scrollToView } from "./carousel.utils"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "carousel",
      initial: ctx.autoplay ? "autoplay" : "idle",
      context: {
        dir: "ltr",
        index: 0,
        orientation: "horizontal",
        loop: false,
        slidesPerView: 1,
        spacing: "0px",
        scrollBy: "view",
        autoplayInterval: 2000,
        draggable: false,
        inViewThreshold: 0.6,
        ...ctx,
        translations: {
          nextTrigger: "Next slide",
          prevTrigger: "Previous slide",
          ...ctx.translations,
        },
        views: [],
        intersections: new Set<Element>(),
      },

      watch: {
        slidesPerView: ["measureViews"],
      },

      on: {
        "GOTO.NEXT": {
          actions: ["scrollToNext"],
        },
        "GOTO.PREV": {
          actions: ["scrollToPrev"],
        },
        GOTO: {
          actions: ["scrollTo"],
        },
        PLAY: "autoplay",
      },

      states: {
        idle: {
          on: {
            MOUSE_DOWN: "dragging",
          },
        },

        dragging: {
          activities: ["trackPointerMove"],
          entry: ["disableScrollSnap"],
          on: {
            POINTER_MOVE: {
              actions: ["dragScroll"],
            },
            POINTER_UP: {
              target: "idle",
              actions: ["endDragging"],
            },
          },
        },

        autoplay: {
          activities: ["trackDocumentVisibility"],
          every: {
            AUTOPLAY_INTERVAL: ["scrollToNext"],
          },
          on: {
            PAUSE: "idle",
          },
        },
      },
      activities: ["trackSlideMutation", "trackSlideIntersections", "trackScroll"],
      entry: ["measureViews", "scrollToActiveView"],
      computed: {
        isRtl: (ctx) => ctx.dir === "rtl",
        isHorizontal: (ctx) => ctx.orientation === "horizontal",
        isVertical: (ctx) => ctx.orientation === "vertical",
        canScrollNext: (ctx) => ctx.loop || ctx.index < ctx.views.length - 1,
        canScrollPrev: (ctx) => ctx.loop || ctx.index > 0,
      },
    },
    {
      activities: {
        trackSlideMutation(ctx, _evt, { send }) {
          const slideGroupEl = dom.getItemGroupEl(ctx)
          if (!slideGroupEl) return
          const win = dom.getWin(ctx)
          const observer = new win.MutationObserver(() => {
            send({ type: "MEASURE_VIEWS" })
          })
          observer.observe(slideGroupEl, { childList: true, subtree: true })
          return () => observer.disconnect()
        },

        trackSlideIntersections(ctx) {
          const slideGroupEl = dom.getItemGroupEl(ctx)
          if (!slideGroupEl) return
          const win = dom.getWin(ctx)

          const observer = new win.IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  ctx.intersections.add(entry.target)
                } else {
                  ctx.intersections.delete(entry.target)
                }
              })
            },
            {
              root: slideGroupEl,
              threshold: ctx.inViewThreshold,
            },
          )

          dom.getItemEls(ctx).forEach((slide) => observer.observe(slide))
          return () => observer.disconnect()
        },

        trackScroll(ctx, _, { getState }) {
          const slideGroupEl = dom.getItemGroupEl(ctx)
          if (!slideGroupEl) return

          const onScrollEnd = () => {
            if (ctx.intersections.size === 0) return

            // Sort intersecting elements based on their document position
            const intersections = Array.from(ctx.intersections).sort((a, b) =>
              a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
            )

            const firstIntersecting = intersections[0]
            const indexString = (firstIntersecting as HTMLElement).dataset.index

            if (!indexString) return // Safeguard against missing data-index

            const slideIndex = parseInt(indexString, 10)
            const currentView = ctx.views.findIndex((view) => view[0] === slideIndex)
            const newIndex = clamp(currentView, 0, dom.getItemEls(ctx).length)

            if (ctx.index === newIndex) return

            set.index(ctx, newIndex)
          }

          const onScroll = () => {
            // Not using `scrollend` as some browsers trigger it before snapping finishes
            clearTimeout(ctx._scrollEndTimeout)
            ctx._scrollEndTimeout = setTimeout(() => {
              if (ctx.draggable && getState().matches("dragging")) return
              onScrollEnd()
            }, 150)
          }

          return addDomEvent(slideGroupEl, "scroll", onScroll, {
            passive: true,
            capture: true,
          })
        },

        trackDocumentVisibility(ctx, _evt, { send }) {
          const doc = dom.getDoc(ctx)
          const onVisibilityChange = () => {
            if (doc.visibilityState !== "visible") {
              send({ type: "PAUSE", src: "document-hidden" })
            }
          }
          doc.addEventListener("visibilitychange", onVisibilityChange)
          return () => {
            doc.removeEventListener("visibilitychange", onVisibilityChange)
          }
        },

        trackPointerMove(ctx, _evt, { send }) {
          const doc = dom.getDoc(ctx)
          return trackPointerMove(doc, {
            onPointerMove({ event }) {
              send({ type: "POINTER_MOVE", left: -event.movementX, top: -event.movementY })
            },
            onPointerUp() {
              send({ type: "POINTER_UP" })
            },
          })
        },
      },

      guards: {
        loop: (ctx) => ctx.loop,
        isLastSlide: (ctx) => ctx.index === ctx.views.length - 1,
        isFirstSlide: (ctx) => ctx.index === 0,
      },

      actions: {
        scrollToNext(ctx) {
          const index = nextIndex(ctx.views, ctx.index, { loop: ctx.loop })
          scrollToView(ctx, index)
          set.index(ctx, index)
        },
        scrollToPrev(ctx) {
          const index = prevIndex(ctx.views, ctx.index, { loop: ctx.loop })
          scrollToView(ctx, index)
          set.index(ctx, index)
        },
        scrollTo(ctx, evt) {
          const index = clamp(evt.index, 0, ctx.views.length - 1)
          scrollToView(ctx, index)
          set.index(ctx, index)
        },
        measureViews(ctx) {
          const snapPoints = getScrollSnapPositions(dom.getItemGroupEl(ctx)!)
          const axisPoint = ctx.isHorizontal ? snapPoints.x : snapPoints.y

          // Calculate views based on slidesPerView
          const views = axisPoint.map((_v, key) => [key])
          ctx.views = views

          // Clamp the index to fit within the calculated views
          const newIndex = clamp(ctx.index, 0, views.length - 1)
          set.index(ctx, newIndex)
        },
        scrollToActiveView(ctx) {
          scrollToView(ctx, ctx.index, "instant")
        },
        disableScrollSnap(ctx) {
          const slideGroupEl = dom.getItemGroupEl(ctx)
          if (!slideGroupEl) return
          slideGroupEl.style.setProperty("scroll-snap-type", "none")
        },
        dragScroll(ctx, evt) {
          const slideGroupEl = dom.getItemGroupEl(ctx)
          if (!slideGroupEl) return
          slideGroupEl.scrollBy({ left: evt.left, top: evt.top, behavior: "instant" })
        },
        endDragging(ctx) {
          const el = dom.getItemGroupEl(ctx)
          if (!el) return

          const startX = el.scrollLeft
          const startY = el.scrollTop

          const snapPositions = getScrollSnapPositions(el)

          // Find closest x snap point
          const closestX = snapPositions.x.reduce((closest, curr) => {
            return Math.abs(curr - startX) < Math.abs(closest - startX) ? curr : closest
          }, snapPositions.x[0])

          // Find closest y snap point
          const closestY = snapPositions.y.reduce((closest, curr) => {
            return Math.abs(curr - startY) < Math.abs(closest - startY) ? curr : closest
          }, snapPositions.y[0])

          raf(() => {
            // Scroll to closest snap points
            el.scrollTo({
              left: closestX,
              top: closestY,
              behavior: "smooth",
            })
          })
        },
      },
      delays: {
        AUTOPLAY_INTERVAL: (ctx) => ctx.autoplayInterval,
      },
    },
  )
}

const invoke = {
  change: (ctx: MachineContext) => {
    ctx.onIndexChange?.({ index: ctx.index })
  },
}

const set = {
  index: (ctx: MachineContext, index: number) => {
    if (isEqual(ctx.index, index)) return
    ctx.index = index
    invoke.change(ctx)
  },
}
