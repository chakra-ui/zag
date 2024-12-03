import { createMachine } from "@zag-js/core"
import { compact, isEqual, nextIndex, prevIndex } from "@zag-js/utils"
import { dom } from "./carousel.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./carousel.types"
import { clamp, scrollToView, waitForEvent } from "./carousel.utils"
import { addDomEvent } from "@zag-js/dom-event"
import { raf } from "@zag-js/dom-query"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "carousel",
      initial: ctx.autoplay ? "autoplay" : "idle",
      context: {
        index: 0,
        orientation: "horizontal",
        loop: false,
        slidesPerView: 1,
        spacing: "0px",
        scrollBy: "view",
        autoplayInterval: 2000,
        draggable: false,
        ...ctx,
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
          entry: ["addListeners", "disableSnap"],
          on: {
            POINTER_UP: { target: "idle", actions: ["endDragging"] },
            POINTER_MOVE: {
              actions: ["dragScroll"],
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
          const slideGroupEl = dom.getSlideGroupEl(ctx)
          if (!slideGroupEl) return
          const win = dom.getWin(ctx)
          const observer = new win.MutationObserver(() => {
            send({ type: "MEASURE_VIEWS" })
          })
          observer.observe(slideGroupEl, { childList: true, subtree: true })
          return () => {
            observer.disconnect()
          }
        },

        trackSlideIntersections(ctx) {
          const slideGroupEl = dom.getSlideGroupEl(ctx)
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
              threshold: 0.6,
            },
          )

          dom.getSlideEls(ctx).forEach((slide) => observer.observe(slide))

          return () => {
            observer.disconnect()
          }
        },

        trackScroll(ctx, _, { getState }) {
          const slideGroupEl = dom.getSlideGroupEl(ctx)
          if (!slideGroupEl) return

          let cleanup: VoidFunction

          const onScrollEnd = () => {
            if (ctx.intersections.size === 0) return

            // Sort intersecting elements based on their document position
            const sortedIntersections = Array.from(ctx.intersections).sort((a, b) =>
              a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
            )

            const firstIntersecting = sortedIntersections[0]
            const indexString = (firstIntersecting as HTMLElement).dataset.index

            if (!indexString) return // Safeguard against missing data-index

            const slideIndex = parseInt(indexString, 10)
            const currentView = ctx.views.findIndex((view) => view[0] === slideIndex)
            const newIndex = clamp(currentView, 0, dom.getSlideEls(ctx).length)

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

          cleanup = addDomEvent(slideGroupEl, "scroll", onScroll, { passive: true, capture: true })

          return () => cleanup()
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
          const slidesPerView = Math.floor(ctx.slidesPerView)
          const slideElements = dom.getSlideEls(ctx)

          // Calculate views based on slidesPerView
          const views = slideElements.reduce<number[][]>((acc, _, index) => {
            const currentView = acc.at(-1)
            if (currentView && currentView.length < slidesPerView) {
              currentView.push(index)
            } else {
              acc.push([index])
            }
            return acc
          }, [])

          // Adjust for peeking slides
          if (views.length >= 2) {
            const lastView = views.at(-1)!
            const secondLastView = views.at(-2)!

            const deficit = ctx.slidesPerView - lastView.length
            if (deficit > 0) {
              const overflow = secondLastView.splice(slidesPerView - deficit)
              lastView.unshift(...overflow)
            }
          }

          ctx.views = views

          // Clamp the index to fit within the calculated views
          const newIndex = clamp(ctx.index, 0, views.length - 1)
          if (newIndex !== ctx.index) {
            set.index(ctx, newIndex)
          }
        },
        scrollToActiveView(ctx) {
          scrollToView(ctx, ctx.index, "instant")
        },
        addListeners(ctx, _, { send }) {
          const slideGroupEl = dom.getSlideGroupEl(ctx)
          if (!slideGroupEl) return

          const handleMove = (moveEvent: PointerEvent) => {
            send({ type: "POINTER_MOVE", left: -moveEvent.movementX, top: -moveEvent.movementY })
          }

          const handleEnd = () => {
            dom.getDoc(ctx).removeEventListener("pointermove", handleMove, {
              capture: true,
            })
            send({ type: "POINTER_UP" })

            //* Not sure if this cleanup is okay
            dom.getDoc(ctx).removeEventListener("pointerup", handleEnd, {
              capture: true,
            })
          }

          dom.getDoc(ctx).addEventListener("pointermove", handleMove, {
            capture: true,
            passive: true,
          })
          dom.getDoc(ctx).addEventListener("pointerup", handleEnd, {
            capture: true,
            once: true,
          })
        },
        disableSnap(ctx) {
          const slideGroupEl = dom.getSlideGroupEl(ctx)
          if (!slideGroupEl) return
          slideGroupEl.style.setProperty("scroll-snap-type", "none")
        },
        dragScroll(ctx, evt) {
          const slideGroupEl = dom.getSlideGroupEl(ctx)
          if (!slideGroupEl) return

          slideGroupEl.scrollBy({
            left: evt.left,
            top: evt.top,
            behavior: "instant",
          })
        },
        endDragging(ctx) {
          const slideGroupEl = dom.getSlideGroupEl(ctx)
          if (!slideGroupEl) return

          // Capture initial scroll position
          const startLeft = slideGroupEl.scrollLeft
          const startTop = slideGroupEl.scrollTop

          // Temporarily disable scroll snap and hide overflow
          slideGroupEl.style.removeProperty("scroll-snap-type")
          slideGroupEl.style.setProperty("overflow", "hidden")

          // Capture final scroll position after disabling snap
          const finalLeft = slideGroupEl.scrollLeft
          const finalTop = slideGroupEl.scrollTop

          // Restore initial scroll position instantly
          slideGroupEl.style.removeProperty("overflow")
          slideGroupEl.style.setProperty("scroll-snap-type", "none")
          slideGroupEl.scrollTo({ left: startLeft, top: startTop, behavior: "instant" })

          raf(async () => {
            if (startLeft !== finalLeft || startTop !== finalTop) {
              // Smoothly scroll to the final position
              slideGroupEl.scrollTo({ left: finalLeft, top: finalTop, behavior: "smooth" })

              // Wait for the "scrollend" event to ensure smooth scrolling completes
              await waitForEvent(slideGroupEl, "scrollend")
            }
            // Remove scroll snap after scrolling finishes
            slideGroupEl.style.removeProperty("scroll-snap-type")
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
