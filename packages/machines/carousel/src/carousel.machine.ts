import { createMachine } from "@zag-js/core"
import { addDomEvent, trackPointerMove } from "@zag-js/dom-event"
import { raf } from "@zag-js/dom-query"
import { getScrollSnapPositions, getSnapPointTarget } from "@zag-js/scroll-snap"
import { add, compact, isEqual, isObject, nextIndex, prevIndex, remove } from "@zag-js/utils"
import { dom } from "./carousel.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./carousel.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "carousel",
      initial: ctx.autoplay ? "autoplay" : "idle",
      context: {
        dir: "ltr",
        snapIndex: 0,
        orientation: "horizontal",
        snapType: "mandatory",
        loop: false,
        slidesPerView: 1,
        spacing: "0px",
        scrollBy: "view",
        autoplay: false,
        draggable: false,
        inViewThreshold: 0.6,
        ...ctx,
        translations: {
          nextTrigger: "Next slide",
          prevTrigger: "Previous slide",
          ...ctx.translations,
        },
        snapPoints: [],
        slidesInView: [],
      },

      computed: {
        isRtl: (ctx) => ctx.dir === "rtl",
        isHorizontal: (ctx) => ctx.orientation === "horizontal",
        isVertical: (ctx) => ctx.orientation === "vertical",
        canScrollNext: (ctx) => ctx.loop || ctx.snapIndex < ctx.snapPoints.length - 1,
        canScrollPrev: (ctx) => ctx.loop || ctx.snapIndex > 0,
        autoplayInterval: (ctx) => (isObject(ctx.autoplay) ? ctx.autoplay.delay : 4000),
      },

      watch: {
        slidesPerView: ["setSnapPoints"],
        snapIndex: ["scrollToSnapIndex"],
      },

      on: {
        "GOTO.NEXT": {
          target: "idle",
          actions: ["clearScrollEndTimer", "setNextSnapIndex"],
        },
        "GOTO.PREV": {
          target: "idle",
          actions: ["clearScrollEndTimer", "setPrevSnapIndex"],
        },
        GOTO: {
          target: "idle",
          actions: ["clearScrollEndTimer", "setSnapIndex"],
        },
        "SLIDE.MUTATION": {
          actions: ["setSnapPoints"],
        },
      },

      activities: ["trackSlideMutation", "trackSlideIntersections"],

      entry: ["resetScrollPosition", "setSnapPoints", "setSnapIndex"],

      exit: ["clearScrollEndTimer"],

      states: {
        idle: {
          activities: ["trackScroll"],
          on: {
            MOUSE_DOWN: "dragging",
            "AUTOPLAY.START": "autoplay",
          },
        },

        dragging: {
          activities: ["trackPointerMove"],
          entry: ["disableScrollSnap"],
          on: {
            POINTER_MOVE: {
              actions: ["scrollSlides"],
            },
            POINTER_UP: {
              target: "idle",
              actions: ["endDragging"],
            },
          },
        },

        autoplay: {
          activities: ["trackDocumentVisibility", "trackScroll"],
          every: {
            AUTOPLAY_INTERVAL: ["setNextSnapIndex"],
          },
          on: {
            "AUTOPLAY.PAUSE": "idle",
          },
        },
      },
    },
    {
      activities: {
        trackSlideMutation(ctx, _evt, { send }) {
          const el = dom.getItemGroupEl(ctx)
          if (!el) return
          const win = dom.getWin(ctx)
          const observer = new win.MutationObserver(() => {
            send({ type: "SLIDE.MUTATION" })
          })
          observer.observe(el, { childList: true, subtree: true })
          return () => observer.disconnect()
        },

        trackSlideIntersections(ctx) {
          const el = dom.getItemGroupEl(ctx)
          const win = dom.getWin(ctx)

          const observer = new win.IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                const target = entry.target as HTMLElement
                const index = Number(target.dataset.index ?? "-1")
                if (index == null || Number.isNaN(index) || index === -1) return
                ctx.slidesInView = entry.isIntersecting ? add(ctx.slidesInView, index) : remove(ctx.slidesInView, index)
              })
            },
            {
              root: el,
              threshold: ctx.inViewThreshold,
            },
          )

          dom.getItemEls(ctx).forEach((slide) => observer.observe(slide))
          return () => observer.disconnect()
        },

        trackScroll(ctx) {
          const el = dom.getItemGroupEl(ctx)
          if (!el) return

          const onScrollEnd = () => {
            if (ctx.slidesInView.length === 0) return

            const axisSnapPoints = getScrollSnapPositions(el)
            const snapPoints = ctx.isHorizontal ? axisSnapPoints.x : axisSnapPoints.y

            const index = snapPoints.findIndex((point) => Math.abs(point - el.scrollLeft) < 1)
            if (index === -1) return

            set.snapIndex(ctx, index)
          }

          const onScroll = () => {
            clearTimeout(ctx.scrollEndTimeout)
            ctx.scrollEndTimeout = setTimeout(() => {
              onScrollEnd?.()
            }, 150)
          }

          return addDomEvent(el, "scroll", onScroll, { passive: true })
        },

        trackDocumentVisibility(ctx, _evt, { send }) {
          const doc = dom.getDoc(ctx)
          const onVisibilityChange = () => {
            if (doc.visibilityState === "visible") return
            send({ type: "PAUSE", src: "document-hidden" })
          }
          return addDomEvent(doc, "visibilitychange", onVisibilityChange)
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
        isLastSlide: (ctx) => ctx.snapIndex === ctx.snapPoints.length - 1,
        isFirstSlide: (ctx) => ctx.snapIndex === 0,
      },

      actions: {
        resetScrollPosition(ctx) {
          const el = dom.getItemGroupEl(ctx)
          el.scrollTo(0, 0)
        },
        clearScrollEndTimer(ctx) {
          clearTimeout(ctx.scrollEndTimeout)
        },
        scrollToSnapIndex(ctx, evt) {
          const behavior = evt.instant ? "instant" : "smooth"
          const index = clamp(evt.index ?? ctx.snapIndex, 0, ctx.snapPoints.length - 1)
          const el = dom.getItemGroupEl(ctx)
          const axis = ctx.isHorizontal ? "left" : "top"
          el.scrollTo({ [axis]: ctx.snapPoints[index], behavior })
        },
        setNextSnapIndex(ctx) {
          const index = nextIndex(ctx.snapPoints, ctx.snapIndex, { loop: ctx.loop })
          set.snapIndex(ctx, index)
        },
        setPrevSnapIndex(ctx) {
          const index = prevIndex(ctx.snapPoints, ctx.snapIndex, { loop: ctx.loop })
          set.snapIndex(ctx, index)
        },
        setSnapIndex(ctx, evt) {
          set.snapIndex(ctx, evt.index ?? ctx.snapIndex)
        },
        setSnapPoints(ctx) {
          const el = dom.getItemGroupEl(ctx)
          const scrollSnapPoints = getScrollSnapPositions(el)
          ctx.snapPoints = ctx.isHorizontal ? scrollSnapPoints.x : scrollSnapPoints.y
        },
        disableScrollSnap(ctx) {
          const el = dom.getItemGroupEl(ctx)
          const styles = getComputedStyle(el)
          el.dataset.scrollSnapType = styles.getPropertyValue("scroll-snap-type")
          el.style.setProperty("scroll-snap-type", "none")
        },
        scrollSlides(ctx, evt) {
          const el = dom.getItemGroupEl(ctx)
          el.scrollBy({ left: evt.left, top: evt.top, behavior: "instant" })
        },
        endDragging(ctx) {
          const el = dom.getItemGroupEl(ctx)
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
            el.scrollTo({ left: closestX, top: closestY, behavior: "smooth" })
            const scrollSnapType = el.dataset.scrollSnapType
            if (scrollSnapType) {
              el.style.removeProperty("scroll-snap-type")
              delete el.dataset.scrollSnapType
            }
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
  snapChange: (ctx: MachineContext) => {
    const slideGroupEl = dom.getItemGroupEl(ctx)
    ctx.onSnapChange?.({
      snapIndex: ctx.snapIndex,
      snapPoint: ctx.snapPoints[ctx.snapIndex],
      snapTarget: getSnapPointTarget(slideGroupEl!, ctx.snapPoints[ctx.snapIndex]),
    })
  },
}

const set = {
  snapIndex: (ctx: MachineContext, index: number) => {
    const idx = clamp(index, 0, ctx.snapPoints.length - 1)
    if (isEqual(ctx.snapIndex, idx)) return
    ctx.snapIndex = idx
    invoke.snapChange(ctx)
  },
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
