import { setup, type Params } from "@zag-js/core"
import { resizeObserverBorderBox } from "@zag-js/dom-query"
import type { Rect } from "@zag-js/types"
import { callAll, first, isEqual, last } from "@zag-js/utils"
import * as dom from "./toc.dom"
import type { TocSchema } from "./toc.types"

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
    }
  },

  computed: {
    activeItems({ context, prop }) {
      const ids = context.get("activeIds")
      return prop("items").filter((item) => ids.includes(item.value))
    },
  },

  watch({ context, track, action }) {
    track([() => context.get("activeIds").join()], () => {
      action(["autoScrollToc", "syncIndicatorRect"])
    })
  },

  entry: ["syncIndicatorRect"],
  exit: ["cleanupIndicatorObserver"],

  on: {
    "ACTIVE_IDS.SET": {
      actions: ["setActiveIds"],
    },
  },

  states: {
    idle: {
      effects: ["trackHeadingVisibility"],
    },
  },

  implementations: {
    actions: {
      setActiveIds(params) {
        const { context, event } = params
        context.set("activeIds", event.value)
        invokeOnActiveChange(params)
      },

      autoScrollToc({ context, scope, prop }) {
        if (!prop("autoScroll")) return
        const tocItemEl = dom.getItemEl(scope, first(context.get("activeIds")))
        tocItemEl?.scrollIntoView({
          behavior: prop("scrollBehavior"),
          block: "nearest",
        })
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
        const { scope, prop, context, refs } = params

        const items = prop("items")
        if (items.length === 0) return

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

          // Collect all visible heading ids in document order
          const nextActiveIds: string[] = []
          for (const item of items) {
            if (visibilityMap.get(item.value)) {
              nextActiveIds.push(item.value)
            }
          }

          // If nothing is intersecting, keep the current activeIds.
          // This handles the "heading scrolled past" case — the user is still
          // in that section even though the heading itself left the viewport.
          if (nextActiveIds.length === 0) return

          const currentActiveIds = context.get("activeIds")
          if (!isEqual(currentActiveIds, nextActiveIds)) {
            context.set("activeIds", nextActiveIds)
            invokeOnActiveChange(params)
          }
        }, observerOptions)

        for (const item of items) {
          const headingEl = dom.getHeadingEl(scope, item.value)
          if (headingEl) {
            observer.observe(headingEl)
          }
        }

        return () => {
          observer.disconnect()
          visibilityMap.clear()
        }
      },
    },
  },
})

function invokeOnActiveChange(params: Params<TocSchema>) {
  const { context, computed, prop } = params
  prop("onActiveChange")?.({
    activeIds: context.get("activeIds"),
    activeItems: computed("activeItems"),
  })
}
