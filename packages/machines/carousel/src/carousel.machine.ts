import { createMachine, ref } from "@zag-js/core"
import { addDomEvent, trackPointerMove } from "@zag-js/dom-event"
import { raf } from "@zag-js/dom-query"
import { findSnapPoint, getScrollSnapPositions } from "@zag-js/scroll-snap"
import { add, compact, isEqual, isObject, nextIndex, prevIndex, remove, uniq } from "@zag-js/utils"
import { dom } from "./carousel.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./carousel.types"

const DEFAULT_SLIDES_PER_PAGE = 1
const DEFAULT_SLIDES_PER_MOVE = "auto"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "carousel",
      initial: ctx.autoplay ? "autoplay" : "idle",
      context: {
        dir: "ltr",
        page: 0,
        orientation: "horizontal",
        snapType: "mandatory",
        loop: false,
        slidesPerPage: DEFAULT_SLIDES_PER_PAGE,
        slidesPerMove: DEFAULT_SLIDES_PER_MOVE,
        spacing: "0px",
        autoplay: false,
        allowMouseDrag: false,
        inViewThreshold: 0.6,
        ...ctx,
        timeoutRef: ref({ current: undefined }),
        translations: {
          nextTrigger: "Next slide",
          prevTrigger: "Previous slide",
          indicator: (index) => `Go to slide ${index + 1}`,
          item: (index, count) => `${index + 1} of ${count}`,
          autoplayStart: "Start slide rotation",
          autoplayStop: "Stop slide rotation",
          ...ctx.translations,
        },
        pageSnapPoints: getPageSnapPoints(
          ctx.slideCount,
          ctx.slidesPerMove ?? DEFAULT_SLIDES_PER_MOVE,
          ctx.slidesPerPage ?? DEFAULT_SLIDES_PER_PAGE,
        ),
        slidesInView: [],
      },

      computed: {
        isRtl: (ctx) => ctx.dir === "rtl",
        isHorizontal: (ctx) => ctx.orientation === "horizontal",
        canScrollNext: (ctx) => ctx.loop || ctx.page < ctx.pageSnapPoints.length - 1,
        canScrollPrev: (ctx) => ctx.loop || ctx.page > 0,
        autoplayInterval: (ctx) => (isObject(ctx.autoplay) ? ctx.autoplay.delay : 4000),
      },

      watch: {
        slidesPerPage: ["setSnapPoints"],
        page: ["scrollToPage", "focusIndicatorEl"],
        orientation: ["setSnapPoints", "scrollToPage"],
      },

      on: {
        "PAGE.NEXT": {
          target: "idle",
          actions: ["clearScrollEndTimer", "setNextPage"],
        },
        "PAGE.PREV": {
          target: "idle",
          actions: ["clearScrollEndTimer", "setPrevPage"],
        },
        "PAGE.SET": {
          target: "idle",
          actions: ["clearScrollEndTimer", "setPage"],
        },
        "INDEX.SET": {
          target: "idle",
          actions: ["clearScrollEndTimer", "setMatchingPage"],
        },
        "SNAP.REFRESH": {
          actions: ["setSnapPoints", "clampPage"],
        },
      },

      activities: ["trackSlideMutation", "trackSlideIntersections", "trackSlideResize"],

      entry: ["resetScrollPosition", "setSnapPoints", "setPage"],

      exit: ["clearScrollEndTimer"],

      states: {
        idle: {
          activities: ["trackScroll"],
          on: {
            "DRAGGING.START": {
              target: "dragging",
              actions: ["invokeDragStart"],
            },
            "AUTOPLAY.START": {
              target: "autoplay",
              actions: ["invokeAutoplayStart"],
            },
          },
        },

        dragging: {
          activities: ["trackPointerMove"],
          entry: ["disableScrollSnap"],
          on: {
            DRAGGING: {
              actions: ["scrollSlides", "invokeDragging"],
            },
            "DRAGGING.END": {
              target: "idle",
              actions: ["endDragging", "invokeDraggingEnd"],
            },
          },
        },

        autoplay: {
          activities: ["trackDocumentVisibility", "trackScroll"],
          exit: ["invokeAutoplayEnd"],
          every: {
            AUTOPLAY_INTERVAL: ["setNextPage", "invokeAutoplay"],
          },
          on: {
            "DRAGGING.START": {
              target: "dragging",
              actions: ["invokeDragStart"],
            },
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
            send({ type: "SNAP.REFRESH", src: "slide.mutation" })
            dom.syncTabIndex(ctx)
          })
          dom.syncTabIndex(ctx)
          observer.observe(el, { childList: true, subtree: true })
          return () => observer.disconnect()
        },

        trackSlideResize(ctx, _evt, { send }) {
          const el = dom.getItemGroupEl(ctx)
          if (!el) return
          const win = dom.getWin(ctx)
          const observer = new win.ResizeObserver(() => {
            send({ type: "SNAP.REFRESH", src: "slide.resize" })
          })
          dom.getItemEls(ctx).forEach((slide) => observer.observe(slide))
          return () => observer.disconnect()
        },

        trackSlideIntersections(ctx) {
          const el = dom.getItemGroupEl(ctx)
          const win = dom.getWin(ctx)

          const observer = new win.IntersectionObserver(
            (entries) => {
              const slidesInView = entries.reduce((acc, entry) => {
                const target = entry.target as HTMLElement
                const index = Number(target.dataset.index ?? "-1")
                if (index == null || Number.isNaN(index) || index === -1) return acc
                return entry.isIntersecting ? add(acc, index) : remove(acc, index)
              }, ctx.slidesInView)

              ctx.slidesInView = uniq(slidesInView)
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
            const scrollPosition = ctx.isHorizontal ? el.scrollLeft : el.scrollTop
            const page = ctx.pageSnapPoints.findIndex((point) => Math.abs(point - scrollPosition) < 1)
            if (page === -1) return
            set.page(ctx, page)
          }

          // Not using `scrollend` as some browsers trigger it before snapping finishes
          const onScroll = () => {
            clearTimeout(ctx.timeoutRef.current)
            ctx.timeoutRef.current = setTimeout(() => {
              onScrollEnd?.()
            }, 150)
          }

          return addDomEvent(el, "scroll", onScroll, { passive: true })
        },

        trackDocumentVisibility(ctx, _evt, { send }) {
          const doc = dom.getDoc(ctx)
          const onVisibilityChange = () => {
            if (doc.visibilityState === "visible") return
            send({ type: "AUTOPLAY.PAUSE", src: "doc.hidden" })
          }
          return addDomEvent(doc, "visibilitychange", onVisibilityChange)
        },

        trackPointerMove(ctx, _evt, { send }) {
          const doc = dom.getDoc(ctx)
          return trackPointerMove(doc, {
            onPointerMove({ event }) {
              send({ type: "DRAGGING", left: -event.movementX, top: -event.movementY })
            },
            onPointerUp() {
              send({ type: "DRAGGING.END" })
            },
          })
        },
      },

      actions: {
        resetScrollPosition(ctx) {
          const el = dom.getItemGroupEl(ctx)
          el.scrollTo(0, 0)
        },
        clearScrollEndTimer(ctx) {
          if (ctx.timeoutRef.current == null) return
          clearTimeout(ctx.timeoutRef.current)
          ctx.timeoutRef.current = undefined
        },
        scrollToPage(ctx, evt) {
          const behavior = evt.instant ? "instant" : "smooth"
          const index = clamp(evt.index ?? ctx.page, 0, ctx.pageSnapPoints.length - 1)
          const el = dom.getItemGroupEl(ctx)
          const axis = ctx.isHorizontal ? "left" : "top"
          el.scrollTo({ [axis]: ctx.pageSnapPoints[index], behavior })
        },
        setNextPage(ctx) {
          const page = nextIndex(ctx.pageSnapPoints, ctx.page, { loop: ctx.loop })
          set.page(ctx, page)
        },
        setPrevPage(ctx) {
          const page = prevIndex(ctx.pageSnapPoints, ctx.page, { loop: ctx.loop })
          set.page(ctx, page)
        },
        setMatchingPage(ctx, evt) {
          const snapPoint = findSnapPoint(
            dom.getItemGroupEl(ctx),
            ctx.isHorizontal ? "x" : "y",
            (node) => node.dataset.index === evt.index.toString(),
          )
          if (snapPoint == null) return

          const page = ctx.pageSnapPoints.indexOf(snapPoint)
          set.page(ctx, page)
        },
        setPage(ctx, evt) {
          set.page(ctx, evt.index ?? ctx.page)
        },
        clampPage(ctx) {
          const index = clamp(ctx.page, 0, ctx.pageSnapPoints.length - 1)
          set.page(ctx, index)
        },
        setSnapPoints(ctx) {
          queueMicrotask(() => {
            const el = dom.getItemGroupEl(ctx)
            const scrollSnapPoints = getScrollSnapPositions(el)
            ctx.pageSnapPoints = ctx.isHorizontal ? scrollSnapPoints.x : scrollSnapPoints.y
          })
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
        focusIndicatorEl(ctx, evt) {
          if (evt.src !== "indicator") return
          const el = dom.getActiveIndicatorEl(ctx)
          raf(() => el.focus({ preventScroll: true }))
        },
        invokeDragStart(ctx) {
          ctx.onDragStatusChange?.({ type: "dragging.start", isDragging: true, page: ctx.page })
        },
        invokeDragging(ctx) {
          ctx.onDragStatusChange?.({ type: "dragging", isDragging: true, page: ctx.page })
        },
        invokeDraggingEnd(ctx) {
          ctx.onDragStatusChange?.({ type: "dragging.end", isDragging: false, page: ctx.page })
        },
        invokeAutoplay(ctx) {
          ctx.onAutoplayStatusChange?.({ type: "autoplay", isPlaying: true, page: ctx.page })
        },
        invokeAutoplayStart(ctx) {
          ctx.onAutoplayStatusChange?.({ type: "autoplay.start", isPlaying: true, page: ctx.page })
        },
        invokeAutoplayEnd(ctx) {
          ctx.onAutoplayStatusChange?.({ type: "autoplay.stop", isPlaying: false, page: ctx.page })
        },
      },

      delays: {
        AUTOPLAY_INTERVAL: (ctx) => ctx.autoplayInterval,
      },
    },
  )
}

const invoke = {
  pageChange: (ctx: MachineContext) => {
    ctx.onPageChange?.({
      page: ctx.page,
      pageSnapPoint: ctx.pageSnapPoints[ctx.page],
    })
  },
}

const set = {
  page: (ctx: MachineContext, value: number) => {
    const page = clamp(value, 0, ctx.pageSnapPoints.length - 1)
    if (isEqual(ctx.page, page)) return
    ctx.page = page
    invoke.pageChange(ctx)
  },
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getPageSnapPoints(totalSlides: number | undefined, slidesPerMove: number | "auto", slidesPerPage: number) {
  if (totalSlides == null) return []
  const snapPoints: number[] = []
  const perMove = slidesPerMove === "auto" ? Math.floor(slidesPerPage) : slidesPerMove
  for (let i = 0; i < totalSlides - 1; i += perMove) snapPoints.push(i)
  return snapPoints
}
