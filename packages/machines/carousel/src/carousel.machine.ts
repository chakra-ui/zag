import { createMachine } from "@zag-js/core"
import { addDomEvent, raf, trackPointerMove } from "@zag-js/dom-query"
import { findSnapPoint, getScrollSnapPositions } from "@zag-js/scroll-snap"
import { add, clampValue, ensureProps, isObject, nextIndex, prevIndex, remove, uniq } from "@zag-js/utils"
import * as dom from "./carousel.dom"
import type { CarouselSchema } from "./carousel.types"

export const machine = createMachine<CarouselSchema>({
  props({ props }) {
    ensureProps(props, ["slideCount"], "carousel")
    return {
      dir: "ltr",
      defaultPage: 0,
      orientation: "horizontal",
      snapType: "mandatory",
      loop: !!props.autoplay,
      slidesPerPage: 1,
      slidesPerMove: "auto",
      spacing: "0px",
      autoplay: false,
      allowMouseDrag: false,
      inViewThreshold: 0.6,
      ...props,
      translations: {
        nextTrigger: "Next slide",
        prevTrigger: "Previous slide",
        indicator: (index) => `Go to slide ${index + 1}`,
        item: (index, count) => `${index + 1} of ${count}`,
        autoplayStart: "Start slide rotation",
        autoplayStop: "Stop slide rotation",
        ...props.translations,
      },
    }
  },

  refs() {
    return {
      timeoutRef: undefined,
    }
  },

  initialState({ prop }) {
    return prop("autoplay") ? "autoplay" : "idle"
  },

  context({ prop, bindable, getContext }) {
    return {
      page: bindable<number>(() => ({
        defaultValue: prop("defaultPage"),
        value: prop("page"),
        onChange(page) {
          const ctx = getContext()
          const pageSnapPoints = ctx.get("pageSnapPoints")
          prop("onPageChange")?.({ page: page, pageSnapPoint: pageSnapPoints[page] })
        },
      })),
      pageSnapPoints: bindable(() => {
        return {
          defaultValue: getPageSnapPoints(prop("slideCount"), prop("slidesPerMove"), prop("slidesPerPage")),
        }
      }),
      slidesInView: bindable<number[]>(() => ({
        defaultValue: [],
      })),
    }
  },

  computed: {
    isRtl: ({ prop }) => prop("dir") === "rtl",
    isHorizontal: ({ prop }) => prop("orientation") === "horizontal",
    canScrollNext: ({ prop, context }) =>
      prop("loop") || context.get("page") < context.get("pageSnapPoints").length - 1,
    canScrollPrev: ({ prop, context }) => prop("loop") || context.get("page") > 0,
    autoplayInterval: ({ prop }) => {
      const autoplay = prop("autoplay")
      return isObject(autoplay) ? autoplay.delay : 4000
    },
  },

  watch({ track, action, context, prop }) {
    track([() => prop("slidesPerPage"), () => prop("slidesPerMove")], () => {
      action(["setSnapPoints"])
    })
    track([() => context.get("page")], () => {
      action(["scrollToPage", "focusIndicatorEl"])
    })
    track([() => prop("orientation")], () => {
      action(["setSnapPoints", "scrollToPage"])
    })
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
    "PAGE.SCROLL": {
      actions: ["scrollToPage"],
    },
  },

  effects: ["trackSlideMutation", "trackSlideIntersections", "trackSlideResize"],

  entry: ["setSnapPoints", "setPage"],

  exit: ["clearScrollEndTimer"],

  states: {
    idle: {
      on: {
        "DRAGGING.START": {
          target: "dragging",
          actions: ["invokeDragStart"],
        },
        "AUTOPLAY.START": {
          target: "autoplay",
          actions: ["invokeAutoplayStart"],
        },
        "USER.SCROLL": {
          target: "userScroll",
        },
      },
    },

    dragging: {
      effects: ["trackPointerMove"],
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

    userScroll: {
      effects: ["trackScroll"],
      on: {
        "SCROLL.END": {
          target: "idle",
          actions: ["setClosestPage"],
        },
      },
    },

    autoplay: {
      effects: ["trackDocumentVisibility", "trackScroll", "autoUpdateSlide"],
      exit: ["invokeAutoplayEnd"],
      on: {
        "AUTOPLAY.TICK": {
          actions: ["setNextPage", "invokeAutoplay"],
        },
        "DRAGGING.START": {
          target: "dragging",
          actions: ["invokeDragStart"],
        },
        "AUTOPLAY.PAUSE": {
          target: "idle",
        },
      },
    },
  },

  implementations: {
    effects: {
      autoUpdateSlide({ computed, send }) {
        const id = setInterval(() => {
          send({ type: "AUTOPLAY.TICK", src: "autoplay.interval" })
        }, computed("autoplayInterval"))
        return () => clearInterval(id)
      },
      trackSlideMutation({ scope, send }) {
        const el = dom.getItemGroupEl(scope)
        if (!el) return
        const win = scope.getWin()
        const observer = new win.MutationObserver(() => {
          send({ type: "SNAP.REFRESH", src: "slide.mutation" })
          dom.syncTabIndex(scope)
        })
        dom.syncTabIndex(scope)
        observer.observe(el, { childList: true, subtree: true })
        return () => observer.disconnect()
      },

      trackSlideResize({ scope, send }) {
        const el = dom.getItemGroupEl(scope)
        if (!el) return
        const win = scope.getWin()
        const exec = () => {
          send({ type: "SNAP.REFRESH", src: "slide.resize" })
        }
        raf(() => {
          exec()
          // sync initial scroll position
          raf(() => {
            send({ type: "PAGE.SCROLL", instant: true })
          })
        })
        const observer = new win.ResizeObserver(exec)
        dom.getItemEls(scope).forEach((slide) => observer.observe(slide))
        return () => observer.disconnect()
      },

      trackSlideIntersections({ scope, prop, context }) {
        const el = dom.getItemGroupEl(scope)
        const win = scope.getWin()

        const observer = new win.IntersectionObserver(
          (entries) => {
            const slidesInView = entries.reduce((acc, entry) => {
              const target = entry.target as HTMLElement
              const index = Number(target.dataset.index ?? "-1")
              if (index == null || Number.isNaN(index) || index === -1) return acc
              return entry.isIntersecting ? add(acc, index) : remove(acc, index)
            }, context.get("slidesInView"))

            context.set("slidesInView", uniq(slidesInView))
          },
          {
            root: el,
            threshold: prop("inViewThreshold"),
          },
        )

        dom.getItemEls(scope).forEach((slide) => observer.observe(slide))
        return () => observer.disconnect()
      },

      trackScroll({ send, refs, scope }) {
        const el = dom.getItemGroupEl(scope)
        if (!el) return

        const onScroll = () => {
          clearTimeout(refs.get("timeoutRef"))
          refs.set("timeoutRef", undefined)

          refs.set(
            "timeoutRef",
            setTimeout(() => {
              send({ type: "SCROLL.END" })
            }, 150),
          )
        }

        return addDomEvent(el, "scroll", onScroll, { passive: true })
      },

      trackDocumentVisibility({ scope, send }) {
        const doc = scope.getDoc()
        const onVisibilityChange = () => {
          if (doc.visibilityState === "visible") return
          send({ type: "AUTOPLAY.PAUSE", src: "doc.hidden" })
        }
        return addDomEvent(doc, "visibilitychange", onVisibilityChange)
      },

      trackPointerMove({ scope, send }) {
        const doc = scope.getDoc()
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
      clearScrollEndTimer({ refs }) {
        if (refs.get("timeoutRef") == null) return
        clearTimeout(refs.get("timeoutRef"))
        refs.set("timeoutRef", undefined)
      },
      scrollToPage({ context, event, scope, computed }) {
        const behavior = event.instant ? "instant" : "smooth"
        const index = clampValue(event.index ?? context.get("page"), 0, context.get("pageSnapPoints").length - 1)
        const el = dom.getItemGroupEl(scope)
        if (!el) return
        const axis = computed("isHorizontal") ? "left" : "top"
        el.scrollTo({ [axis]: context.get("pageSnapPoints")[index], behavior })
      },
      setClosestPage({ context, scope, computed }) {
        const el = dom.getItemGroupEl(scope)
        if (!el) return
        const scrollPosition = computed("isHorizontal") ? el.scrollLeft : el.scrollTop
        const page = context.get("pageSnapPoints").findIndex((point) => Math.abs(point - scrollPosition) < 1)
        if (page === -1) return
        context.set("page", page)
      },
      setNextPage({ context, prop, state }) {
        const loop = state.matches("autoplay") || prop("loop")
        const page = nextIndex(context.get("pageSnapPoints"), context.get("page"), { loop })
        context.set("page", page)
      },
      setPrevPage({ context, prop, state }) {
        const loop = state.matches("autoplay") || prop("loop")
        const page = prevIndex(context.get("pageSnapPoints"), context.get("page"), { loop })
        context.set("page", page)
      },
      setMatchingPage({ context, event, computed, scope }) {
        const el = dom.getItemGroupEl(scope)
        if (!el) return
        const snapPoint = findSnapPoint(
          el,
          computed("isHorizontal") ? "x" : "y",
          (node) => node.dataset.index === event.index.toString(),
        )
        if (snapPoint == null) return

        const page = context.get("pageSnapPoints").findIndex((point) => Math.abs(point - snapPoint) < 1)
        context.set("page", page)
      },
      setPage({ context, event }) {
        const page = event.index ?? context.get("page")
        context.set("page", page)
      },
      clampPage({ context }) {
        const index = clampValue(context.get("page"), 0, context.get("pageSnapPoints").length - 1)
        context.set("page", index)
      },
      setSnapPoints({ context, computed, scope }) {
        const el = dom.getItemGroupEl(scope)
        if (!el) return
        const scrollSnapPoints = getScrollSnapPositions(el)
        context.set("pageSnapPoints", computed("isHorizontal") ? scrollSnapPoints.x : scrollSnapPoints.y)
      },
      disableScrollSnap({ scope }) {
        const el = dom.getItemGroupEl(scope)
        if (!el) return
        const styles = getComputedStyle(el)
        el.dataset.scrollSnapType = styles.getPropertyValue("scroll-snap-type")
        el.style.setProperty("scroll-snap-type", "none")
      },
      scrollSlides({ scope, event }) {
        const el = dom.getItemGroupEl(scope)
        el?.scrollBy({ left: event.left, top: event.top, behavior: "instant" })
      },
      endDragging({ scope, context, computed }) {
        const el = dom.getItemGroupEl(scope)
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
          el.scrollTo({ left: closestX, top: closestY, behavior: "smooth" })

          const closest = computed("isHorizontal") ? closestX : closestY
          context.set("page", context.get("pageSnapPoints").indexOf(closest))

          const scrollSnapType = el.dataset.scrollSnapType
          if (scrollSnapType) {
            el.style.removeProperty("scroll-snap-type")
            delete el.dataset.scrollSnapType
          }
        })
      },
      focusIndicatorEl({ context, event, scope }) {
        if (event.src !== "indicator") return
        const el = dom.getIndicatorEl(scope, context.get("page"))
        if (!el) return
        raf(() => el.focus({ preventScroll: true }))
      },
      invokeDragStart({ context, prop }) {
        prop("onDragStatusChange")?.({ type: "dragging.start", isDragging: true, page: context.get("page") })
      },
      invokeDragging({ context, prop }) {
        prop("onDragStatusChange")?.({ type: "dragging", isDragging: true, page: context.get("page") })
      },
      invokeDraggingEnd({ context, prop }) {
        prop("onDragStatusChange")?.({ type: "dragging.end", isDragging: false, page: context.get("page") })
      },
      invokeAutoplay({ context, prop }) {
        prop("onAutoplayStatusChange")?.({ type: "autoplay", isPlaying: true, page: context.get("page") })
      },
      invokeAutoplayStart({ context, prop }) {
        prop("onAutoplayStatusChange")?.({ type: "autoplay.start", isPlaying: true, page: context.get("page") })
      },
      invokeAutoplayEnd({ context, prop }) {
        prop("onAutoplayStatusChange")?.({ type: "autoplay.stop", isPlaying: false, page: context.get("page") })
      },
    },
  },
})

function getPageSnapPoints(totalSlides: number | undefined, slidesPerMove: number | "auto", slidesPerPage: number) {
  if (totalSlides == null) return []
  const snapPoints: number[] = []
  const perMove = slidesPerMove === "auto" ? Math.floor(slidesPerPage) : slidesPerMove
  for (let i = 0; i < totalSlides - 1; i += perMove) snapPoints.push(i)
  return snapPoints
}
