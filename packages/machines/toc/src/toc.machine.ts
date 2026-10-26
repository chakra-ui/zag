import { setup, type Params } from "@zag-js/core"
import {
  addDomEvent,
  AnimationFrame,
  contains,
  getEventTarget,
  resizeObserverBorderBox,
  scrollToNearest,
  trackScrollEnd,
} from "@zag-js/dom-query"
import type { Rect } from "@zag-js/types"
import { callAll, first, isEqual, last, toArray } from "@zag-js/utils"
import * as dom from "./toc.dom"
import type { TocSchema } from "./toc.types"
import { findCurrentSection, findEndOfPageHeading, getVisibleIds } from "./utils/active-ids"
import { getBandTop, getScrollContainer, isScrolledToHeading, resolveScrollContainer } from "./utils/scroll"

const { createMachine } = setup<TocSchema>()

export const machine = createMachine({
  props({ props }) {
    return {
      dir: "ltr" as const,
      rootMargin: "-20px 0% -40% 0%",
      threshold: 0,
      autoScroll: true,
      scrollBehavior: "smooth",
      items: [],
      multiple: true,
      ...props,
    }
  },

  initialState() {
    return "idle"
  },

  context({ prop, bindable }) {
    return {
      activeIds: bindable<string[]>(() => ({
        defaultValue: prop("defaultActiveIds") ?? [],
        value: prop("activeIds"),
        isEqual,
        onChange(value) {
          prop("onActiveChange")?.({
            activeIds: value,
            activeItems: prop("items").filter((item) => value.includes(item.value)),
          })
        },
      })),
      indicatorRect: bindable<Rect | null>(() => ({
        defaultValue: null,
      })),
    }
  },

  refs() {
    return {
      headings: [],
      headingObserver: null,
      scrollContainer: null,
      visibilityMap: new Map<string, boolean>(),
      rootBounds: null,
      indicatorCleanup: null,
    }
  },

  computed: {
    activeItems({ context, prop }) {
      const ids = context.get("activeIds")
      return prop("items").filter((item) => ids.includes(item.value))
    },
  },

  watch({ context, prop, track, action }) {
    track([() => context.get("activeIds").join()], () => {
      action(["autoScrollToc", "syncIndicatorRect"])
    })
    track([() => prop("multiple")], () => {
      action(["syncActiveIds"])
    })
    track(
      [
        () =>
          prop("items")
            .map((item) => item.value)
            .join(),
      ],
      () => {
        action(["syncHeadings"])
      },
    )
  },

  entry: ["syncIndicatorRect"],
  exit: ["cleanupIndicatorObserver"],
  effects: ["trackHeadings"],

  on: {
    "ACTIVE_IDS.SET": {
      actions: ["setActiveIds"],
    },
    SCROLL_TO: {
      target: "navigating",
      actions: ["setActiveIdsToTarget"],
    },
  },

  states: {
    idle: {
      on: {
        "VISIBILITY.CHANGE": {
          actions: ["syncActiveIds"],
        },
        // Jumps and the end of the page change the active heading without an intersection change
        SCROLL: {
          actions: ["syncActiveIds"],
        },
      },
    },

    // Keeps the clicked item active while scrolling to it
    navigating: {
      effects: ["waitForScrollEnd"],
      on: {
        "SCROLL.END": [
          {
            // e.g. a heading near the end that can't scroll to the top
            guard: "isTargetReached",
            target: "idle",
          },
          {
            target: "idle",
            actions: ["syncActiveIds"],
          },
        ],
      },
    },
  },

  implementations: {
    guards: {
      isTargetReached: ({ context, prop, refs }) => {
        if (prop("multiple")) return false
        const targetId = first(context.get("activeIds"))
        const heading = refs.get("headings").find((heading) => heading.value === targetId)
        const container = refs.get("scrollContainer")
        if (!heading || !container) return false
        // Anywhere else means the user interrupted the scroll
        return isScrolledToHeading(heading.el, container)
      },
    },

    actions: {
      setActiveIds({ context, event }) {
        context.set("activeIds", event.value)
      },

      autoScrollToc({ context, scope, prop }) {
        if (!prop("autoScroll")) return
        const activeId = first(context.get("activeIds"))
        const tocItemEl = dom.getItemEl(scope, activeId)
        if (!activeId || !tocItemEl) return
        // `scrollIntoView` would also scroll the content and cancel a smooth scroll to a heading
        const contentEl = prop("scrollEl")?.() ?? dom.getHeadingEl(scope, activeId)
        if (!contentEl) return
        const scrollEl = dom.getScrollEl(tocItemEl, contentEl)
        if (!scrollEl) return
        scrollToNearest(tocItemEl, { rootEl: scrollEl, behavior: prop("scrollBehavior") })
      },

      setActiveIdsToTarget({ context, event }) {
        context.set("activeIds", [event.value])
      },

      syncActiveIds({ context, prop, refs }) {
        const headings = refs.get("headings")
        if (headings.length === 0) return

        const multiple = prop("multiple")
        const visibleIds = getVisibleIds(headings, refs.get("visibilityMap"))
        let nextActiveIds = visibleIds

        // Only single mode and the section fallback read layout
        if (!multiple || visibleIds.length === 0) {
          const container = resolveScrollContainer(refs.get("scrollContainer"), prop("scrollEl")?.(), headings[0].el)
          refs.set("scrollContainer", container)
          const bandTop = getBandTop(container, refs.get("rootBounds"))

          if (!multiple) {
            nextActiveIds = toArray(findEndOfPageHeading(headings, container, bandTop) ?? first(visibleIds))
          }

          // No heading in view: use the section the reader is in
          if (nextActiveIds.length === 0) {
            nextActiveIds = toArray(findCurrentSection(headings, bandTop))
          }
        }

        if (nextActiveIds.length === 0 || isEqual(context.get("activeIds"), nextActiveIds)) return
        context.set("activeIds", nextActiveIds)
      },

      syncHeadings(params) {
        observeHeadings(params)
      },

      cleanupIndicatorObserver({ refs }) {
        refs.get("indicatorCleanup")?.()
      },

      syncIndicatorRect({ context, refs, scope }) {
        refs.get("indicatorCleanup")?.()

        const indicatorEl = dom.getIndicatorEl(scope)
        if (!indicatorEl) return

        const activeIds = context.get("activeIds")
        if (activeIds.length === 0) {
          context.set("indicatorRect", null)
          return
        }

        // Also runs on resize, when the active ids may have changed since
        const measure = () => {
          const ids = context.get("activeIds")
          if (ids.length === 0) {
            context.set("indicatorRect", null)
            return
          }

          const firstEl = dom.getItemEl(scope, first(ids))
          const lastEl = dom.getItemEl(scope, last(ids))
          if (!firstEl) return

          const firstRect = firstEl.getBoundingClientRect()
          const lastRect = (lastEl ?? firstEl).getBoundingClientRect()

          // Relative to the list's scrolled content, or the viewport without a list
          const listEl = dom.getListEl(scope)
          const listRect = listEl?.getBoundingClientRect()
          const originX = listEl && listRect ? listRect.left - listEl.scrollLeft : 0
          const originY = listEl && listRect ? listRect.top - listEl.scrollTop : 0

          const nextRect: Rect = {
            x: firstRect.left - originX,
            y: firstRect.top - originY,
            width: firstRect.width,
            height: lastRect.bottom - firstRect.top,
          }

          context.set("indicatorRect", (prev) => (isEqual(prev, nextRect) ? prev : nextRect))
        }

        measure()

        const cleanups: VoidFunction[] = []
        for (const id of activeIds) {
          const el = dom.getItemEl(scope, id)
          if (el) {
            cleanups.push(resizeObserverBorderBox.observe(el, measure))
          }
        }

        refs.set("indicatorCleanup", () => callAll(...cleanups))
      },
    },

    effects: {
      trackHeadings(params) {
        const { scope, prop, refs, send } = params
        const win = scope.getWin()
        const doc = scope.getDoc()
        const visibilityMap = refs.get("visibilityMap")
        const observer = new win.IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              visibilityMap.set(entry.target.id, entry.isIntersecting)
            }
            refs.set("rootBounds", entries[0]?.rootBounds ?? null)
            send({ type: "VISIBILITY.CHANGE" })
          },
          {
            root: prop("scrollEl")?.() ?? null,
            rootMargin: prop("rootMargin"),
            threshold: prop("threshold"),
          },
        )

        refs.set("headingObserver", observer)
        observeHeadings(params)

        const frame = AnimationFrame.create()
        const onScroll = (event: Event) => {
          if (frame.isActive()) return
          const headings = refs.get("headings")
          if (headings.length === 0) return
          const target = getEventTarget<Node>(event)
          const movesHeadings =
            target === doc || target === refs.get("scrollContainer") || contains(target, headings[0].el)
          if (!movesHeadings) return
          frame.request(() => send({ type: "SCROLL" }))
        }

        const cleanupScroll = addDomEvent(doc, "scroll", onScroll, { capture: true, passive: true })

        return () => {
          observer.disconnect()
          cleanupScroll()
          frame.cancel()
          visibilityMap.clear()
          refs.set("headingObserver", null)
          refs.set("headings", [])
          refs.set("scrollContainer", null)
        }
      },

      waitForScrollEnd({ scope, send }) {
        return trackScrollEnd(scope.getDoc(), () => send({ type: "SCROLL.END" }), { immediate: true, capture: true })
      },
    },
  },
})

/** Caches and observes the headings of the current items */
function observeHeadings({ context, scope, prop, refs }: Params<TocSchema>) {
  const observer = refs.get("headingObserver")
  if (!observer) return

  observer.disconnect()
  refs.get("visibilityMap").clear()

  const headings = dom.getHeadings(scope, prop("items"))
  refs.set("headings", headings)
  refs.set("scrollContainer", headings.length ? getScrollContainer(prop("scrollEl")?.(), headings[0].el) : null)

  // Observing reports each heading's visibility, which resyncs the active ids
  for (const heading of headings) {
    observer.observe(heading.el)
  }

  if (headings.length === 0) context.set("activeIds", [])
}
