import { setup, type Params } from "@zag-js/core"
import { addDomEvent, resizeObserverBorderBox } from "@zag-js/dom-query"
import type { Rect } from "@zag-js/types"
import { callAll, first, isEqual, last } from "@zag-js/utils"
import * as dom from "./toc.dom"
import type { TocSchema } from "./toc.types"
import { getScrollContainer, getViewBounds } from "./utils/scroll"

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
      visibilityMap: new Map<string, boolean>(),
      indicatorCleanup: null,
      scrollLockTimer: null,
      rootBounds: null,
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
  exit: ["cleanupIndicatorObserver", "clearScrollLock"],

  on: {
    "ACTIVE_IDS.SET": {
      actions: ["setActiveIds"],
    },
    SCROLL_TO: {
      actions: ["setScrollTarget"],
    },
  },

  states: {
    idle: {
      effects: ["trackHeadingVisibility"],
    },
  },

  implementations: {
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

      setScrollTarget(params) {
        const { context, event } = params
        context.set("activeIds", [event.value])
        // Hold the clicked item until scrolling settles, so it isn't overridden mid-scroll
        lockScroll(params)
      },

      syncActiveIds(params) {
        syncActiveIds(params)
      },

      clearScrollLock({ refs }) {
        clearTimeout(refs.get("scrollLockTimer") ?? undefined)
        refs.set("scrollLockTimer", null)
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
      trackHeadingVisibility(params) {
        const { scope, prop, refs } = params

        const items = prop("items")
        if (items.length === 0) return

        const doc = scope.getDoc()
        const visibilityMap = refs.get("visibilityMap")

        const observerOptions: IntersectionObserverInit = {
          rootMargin: prop("rootMargin"),
          threshold: prop("threshold"),
        }

        const scrollEl = prop("scrollEl")?.()
        if (scrollEl) {
          observerOptions.root = scrollEl
        }

        const win = scope.getWin()
        const observer = new win.IntersectionObserver((entries) => {
          for (const entry of entries) {
            visibilityMap.set(entry.target.id, entry.isIntersecting)
          }
          refs.set("rootBounds", entries[0]?.rootBounds ?? null)

          if (refs.get("scrollLockTimer") == null) syncActiveIds(params)
        }, observerOptions)

        for (const item of items) {
          const headingEl = dom.getHeadingEl(scope, item.value)
          if (headingEl) {
            observer.observe(headingEl)
          }
        }

        const scrollContainer = getScrollContainer(doc, scrollEl, dom.getHeadingEl(scope, items[0].value))
        const scrollTarget = scrollContainer === doc.scrollingElement ? win : scrollContainer

        let frame = 0
        const onScroll = () => {
          if (refs.get("scrollLockTimer") != null) {
            lockScroll(params)
            return
          }
          // Scrolling near the end moves the activation line without any intersection change
          if (prop("multiple")) return
          win.cancelAnimationFrame(frame)
          frame = win.requestAnimationFrame(() => syncActiveIds(params))
        }

        const cleanupScroll = addDomEvent(scrollTarget, "scroll", onScroll, { passive: true })

        return () => {
          observer.disconnect()
          cleanupScroll()
          win.cancelAnimationFrame(frame)
          visibilityMap.clear()
        }
      },
    },
  },
})

const SCROLL_IDLE_MS = 150

function lockScroll(params: Params<TocSchema>) {
  const { refs, scope, prop } = params
  const win = scope.getWin()
  win.clearTimeout(refs.get("scrollLockTimer") ?? undefined)
  const timer = win.setTimeout(() => {
    refs.set("scrollLockTimer", null)
    if (prop("multiple")) syncActiveIds(params)
  }, SCROLL_IDLE_MS)
  refs.set("scrollLockTimer", timer)
}

function syncActiveIds(params: Params<TocSchema>) {
  const { scope, prop, context, refs } = params
  const items = prop("items")
  const visibilityMap = refs.get("visibilityMap")

  const scrollContainer = getScrollContainer(
    scope.getDoc(),
    prop("scrollEl")?.(),
    dom.getHeadingEl(scope, items[0]?.value),
  )
  // Where headings stop counting as visible: the observed band's top edge (after `rootMargin`),
  // or the scroll container's edge when it clips headings first
  const viewTop = getViewBounds(scrollContainer).top
  const bandTop = Math.max(refs.get("rootBounds")?.top ?? viewTop, viewTop)

  // Visible heading ids in document order
  let nextActiveIds = items.filter((item) => visibilityMap.get(item.value)).map((item) => item.value)

  if (!prop("multiple")) {
    const endId = findEndZoneHeading(params, scrollContainer, bandTop)
    nextActiveIds = endId ? [endId] : nextActiveIds.slice(0, 1)
  }

  // Nothing in view: the reader is inside the section whose heading scrolled past the top
  if (nextActiveIds.length === 0) {
    const sectionId = findLastHeading(params, (r) => r.top <= bandTop)
    if (!sectionId) return
    nextActiveIds = [sectionId]
  }

  if (!isEqual(context.get("activeIds"), nextActiveIds)) {
    context.set("activeIds", nextActiveIds)
  }
}

function findLastHeading(params: Params<TocSchema>, match: (rect: DOMRect) => boolean) {
  const { scope, prop } = params
  const items = prop("items")
  for (let i = items.length - 1; i >= 0; i--) {
    const rect = dom.getHeadingEl(scope, items[i].value)?.getBoundingClientRect()
    if (rect && match(rect)) return items[i].value
  }
  return null
}

// The last headings can't scroll to the top, so over the final stretch of scrolling, slide the
// activation line from the top of the view down to the last heading so each one gets a turn
function findEndZoneHeading(params: Params<TocSchema>, scrollContainer: HTMLElement, bandTop: number) {
  const { scope, prop } = params
  const items = prop("items")
  const lastEl = dom.getHeadingEl(scope, items[items.length - 1]?.value)
  if (!lastEl) return null

  const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight
  const remaining = maxScroll - scrollContainer.scrollTop
  const deficit = lastEl.getBoundingClientRect().top - bandTop - remaining
  if (deficit <= 0) return null

  const stretch = Math.min(deficit, maxScroll)
  if (remaining >= stretch) return null

  const line = bandTop + deficit * (1 - remaining / stretch)
  for (const item of items) {
    const rect = dom.getHeadingEl(scope, item.value)?.getBoundingClientRect()
    if (rect && rect.top >= line - 1) return item.value
  }
  return null
}
