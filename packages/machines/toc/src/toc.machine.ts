import { setup } from "@zag-js/core"
import { addDomEvent, resizeObserverBorderBox } from "@zag-js/dom-query"
import type { Rect } from "@zag-js/types"
import { callAll, first, isEqual, last } from "@zag-js/utils"
import * as dom from "./toc.dom"
import type { TocSchema } from "./toc.types"
import { findCurrentSection, findEndOfPageHeading, getVisibleIds } from "./utils/active-ids"
import { getBandTop, getScrollContainer, getScrollTarget } from "./utils/scroll"

const { createMachine } = setup<TocSchema>()

// How long scrolling must pause before a link-triggered scroll counts as finished
const SCROLL_END_DELAY = 150

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
        // Only sent in single mode: near the end of the page, the active heading changes without any intersection change
        SCROLL: {
          actions: ["syncActiveIds"],
        },
      },
    },

    // Scrolling to a clicked item: keep it active so headings passed on the way don't take over
    navigating: {
      effects: ["waitForScrollEnd"],
      on: {
        "SCROLL.END": [
          {
            guard: "isMultiple",
            target: "idle",
            actions: ["syncActiveIds"],
          },
          {
            target: "idle",
          },
        ],
      },
    },
  },

  implementations: {
    guards: {
      isMultiple: ({ prop }) => prop("multiple"),
    },

    actions: {
      setActiveIds({ context, event }) {
        context.set("activeIds", event.value)
      },

      autoScrollToc({ context, scope, prop }) {
        if (!prop("autoScroll")) return
        const tocItemEl = dom.getItemEl(scope, first(context.get("activeIds")))
        tocItemEl?.scrollIntoView({
          behavior: prop("scrollBehavior"),
          block: "nearest",
        })
      },

      setActiveIdsToTarget({ context, event }) {
        context.set("activeIds", [event.value])
      },

      syncActiveIds({ context, prop, refs }) {
        const headings = refs.get("headings")
        const container = refs.get("scrollContainer")
        if (headings.length === 0 || !container) return

        const bandTop = getBandTop(container, refs.get("rootBounds"))
        const visibleIds = getVisibleIds(prop("items"), refs.get("visibilityMap"))

        let nextActiveIds = visibleIds
        if (!prop("multiple")) {
          const activeId = findEndOfPageHeading(headings, container, bandTop) ?? first(visibleIds)
          nextActiveIds = activeId ? [activeId] : []
        }

        // No heading in view: the reader is inside the section whose heading scrolled past the top
        if (nextActiveIds.length === 0) {
          const sectionId = findCurrentSection(headings, bandTop)
          if (!sectionId) return
          nextActiveIds = [sectionId]
        }

        if (isEqual(context.get("activeIds"), nextActiveIds)) return
        context.set("activeIds", nextActiveIds)
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

        const exec = () => {
          const ids = context.get("activeIds")
          if (ids.length === 0) {
            context.set("indicatorRect", null)
            return
          }

          const firstEl = dom.getItemEl(scope, first(ids))
          const lastEl = dom.getItemEl(scope, last(ids))
          if (!firstEl) return

          const listEl = dom.getListEl(scope)
          const listRect = listEl?.getBoundingClientRect()
          const firstRect = firstEl.getBoundingClientRect()

          const offsetY = listRect ? firstRect.top - listRect.top + listEl!.scrollTop : firstRect.top
          const offsetX = listRect ? firstRect.left - listRect.left + listEl!.scrollLeft : firstRect.left

          let height: number
          if (lastEl && lastEl !== firstEl) {
            const lastRect = lastEl.getBoundingClientRect()
            height = lastRect.top + lastRect.height - firstRect.top
          } else {
            height = firstRect.height
          }

          const nextRect: Rect = {
            x: offsetX,
            y: offsetY,
            width: firstRect.width,
            height,
          }

          context.set("indicatorRect", (prev) => (isEqual(prev, nextRect) ? prev : nextRect))
        }

        exec()

        const cleanups: VoidFunction[] = []
        for (const id of activeIds) {
          const el = dom.getItemEl(scope, id)
          if (el) {
            cleanups.push(resizeObserverBorderBox.observe(el, exec))
          }
        }

        refs.set("indicatorCleanup", () => callAll(...cleanups))
      },
    },

    effects: {
      trackHeadings({ scope, prop, refs, send }) {
        const headings = dom.getHeadings(scope, prop("items"))
        if (headings.length === 0) return

        const win = scope.getWin()
        const scrollEl = prop("scrollEl")?.()
        const container = getScrollContainer(scope.getDoc(), scrollEl, headings[0].el)

        // Looked up once here, so syncing on scroll only reads layout
        refs.set("headings", headings)
        refs.set("scrollContainer", container)

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
            root: scrollEl ?? null,
            rootMargin: prop("rootMargin"),
            threshold: prop("threshold"),
          },
        )

        for (const heading of headings) {
          observer.observe(heading.el)
        }

        // At most one sync per frame, and only in single mode
        let frame = 0
        const onScroll = () => {
          if (frame || prop("multiple")) return
          frame = win.requestAnimationFrame(() => {
            frame = 0
            send({ type: "SCROLL" })
          })
        }

        const cleanupScroll = addDomEvent(getScrollTarget(container), "scroll", onScroll, { passive: true })

        return () => {
          observer.disconnect()
          cleanupScroll()
          win.cancelAnimationFrame(frame)
          visibilityMap.clear()
          refs.set("headings", [])
          refs.set("scrollContainer", null)
        }
      },

      waitForScrollEnd({ scope, send }) {
        const win = scope.getWin()

        let timer = 0
        const restartTimer = () => {
          win.clearTimeout(timer)
          timer = win.setTimeout(() => send({ type: "SCROLL.END" }), SCROLL_END_DELAY)
        }

        // Starts right away, so it also ends when nothing scrolls (the target is already in view)
        restartTimer()

        // Capture catches scrolling in any container, since scroll events don't bubble
        const cleanup = addDomEvent(scope.getDoc(), "scroll", restartTimer, { capture: true, passive: true })
        return () => {
          cleanup()
          win.clearTimeout(timer)
        }
      },
    },
  },
})
