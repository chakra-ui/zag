import { setup } from "@zag-js/core"
import { createLiveRegion } from "@zag-js/live-region"
import { getFirstTabbable, raf } from "@zag-js/dom-query"
import { ensureProps, warn } from "@zag-js/utils"
import * as dom from "./infinite-scroll.dom"
import type { InfiniteScrollParams, InfiniteScrollSchema, LoadMoreReason } from "./infinite-scroll.types"
import { getRootMargin, getScrollingElement, resolveScroller } from "./infinite-scroll.utils"

const { createMachine, guards } = setup<InfiniteScrollSchema>()
const { and, not } = guards

const defaultTranslations = {
  itemsLoaded: (count: number) => `${count} more ${count === 1 ? "item" : "items"} loaded`,
  complete: "All items loaded",
}

export const machine = createMachine({
  props({ props }) {
    ensureProps(props, ["count"], "infinite-scroll")
    return {
      dir: "ltr",
      hasMore: true,
      edge: "end",
      orientation: "vertical",
      offset: 1,
      disabled: false,
      ...props,
      translations: { ...defaultTranslations, ...props.translations },
    }
  },

  initialState({ prop }) {
    if (prop("loading")) return "loading"
    return prop("hasMore") && !prop("disabled") ? "idle" : "inactive"
  },

  effects: ["trackLiveRegion"],

  refs({ prop }) {
    return {
      countAtLoadStart: null,
      anchor: null,
      prevCount: prop("count"),
      liveRegion: null,
    }
  },

  watch({ track, action, send, prop }) {
    track([() => prop("loading")], () => {
      send({ type: prop("loading") ? "LOAD.STARTED" : "LOAD.DONE" })
    })

    track([() => prop("count")], () => {
      action(["restoreScrollAnchor", "announceItemsLoaded"])
      send({ type: "COUNT.CHANGED" })
    })

    // `hasMore` returning means a new list, so clear the growth guard
    track([() => prop("hasMore")], () => {
      if (prop("hasMore")) action(["clearCountSnapshot"])
    })

    track([() => prop("hasMore"), () => prop("disabled")], () => {
      action(["announceComplete"])
      send({ type: "AVAILABILITY.CHANGED" })
    })

    // Effects capture props at entry, so rebuild the observer
    track([() => prop("offset"), () => prop("orientation"), () => prop("edge"), () => prop("dir")], () => {
      send({ type: "OBSERVER.RESYNC" })
    })
  },

  on: {
    RESET: {
      actions: ["clearCountSnapshot"],
    },
    "AVAILABILITY.CHANGED": {
      guard: not("canObserve"),
      target: "inactive",
    },
  },

  states: {
    inactive: {
      on: {
        "AVAILABILITY.CHANGED": {
          guard: "canObserve",
          target: "idle",
        },
        "LOAD.REQUESTED": {
          guard: "hasMore",
          target: "loading",
        },
        RESET: {
          guard: "canObserve",
          target: "idle",
          actions: ["clearCountSnapshot"],
        },
      },
    },

    idle: {
      effects: ["trackSentinelVisibility"],
      on: {
        // Growth guard: a load that added nothing can't trigger the next
        "SENTINEL.INTERSECT": {
          guard: "didGrow",
          target: "loading",
        },
        "LOAD.REQUESTED": {
          target: "loading",
        },
        "LOAD.STARTED": {
          target: "loading",
        },
        // Content can grow inside the margin without a visibility change
        "COUNT.CHANGED": {
          target: "idle",
          reenter: true,
        },
        "OBSERVER.RESYNC": {
          target: "idle",
          reenter: true,
        },
        RESET: {
          target: "idle",
          reenter: true,
          actions: ["clearCountSnapshot"],
        },
      },
    },

    loading: {
      entry: ["snapshotScrollAnchor", "snapshotCount", "invokeOnLoadMore"],
      on: {
        "LOAD.DONE": [
          {
            guard: "canObserve",
            target: "idle",
          },
          {
            target: "inactive",
          },
        ],
        // A controlled load can complete without toggling `loading`
        "COUNT.CHANGED": [
          {
            guard: and("isLoadSettled", "canObserve"),
            target: "idle",
          },
          {
            guard: "isLoadSettled",
            target: "inactive",
          },
        ],
      },
    },
  },

  implementations: {
    guards: {
      canObserve: ({ prop }) => prop("hasMore") && !prop("disabled"),

      hasMore: ({ prop }) => prop("hasMore"),

      didGrow: (params) => didGrow(params),

      isLoadSettled: (params) => params.prop("loading") === false && didGrow(params),
    },

    actions: {
      snapshotCount({ prop, event, refs }) {
        // Only guard loads this machine triggered
        refs.set("countAtLoadStart", event.reason ? prop("count") : null)
      },

      clearCountSnapshot({ refs }) {
        refs.set("countAtLoadStart", null)
      },

      snapshotScrollAnchor({ prop, scope, refs }) {
        if (prop("edge") !== "start") return
        const el = getScrollerEl(scope, prop("scrollEl"))
        if (!el) return
        const vertical = prop("orientation") === "vertical"
        refs.set("anchor", {
          el,
          pos: vertical ? el.scrollTop : el.scrollLeft,
          size: vertical ? el.scrollHeight : el.scrollWidth,
        })
      },

      restoreScrollAnchor({ prop, refs }) {
        const anchor = refs.get("anchor")
        if (!anchor) return
        refs.set("anchor", null)

        const { el } = anchor
        const vertical = prop("orientation") === "vertical"
        const delta = (vertical ? el.scrollHeight : el.scrollWidth) - anchor.size
        if (delta === 0) return

        // RTL scrolls negative, so prepended content moves the offset the opposite way.
        const rtl = !vertical && prop("dir") === "rtl"
        const expected = rtl ? anchor.pos - delta : anchor.pos + delta

        const current = vertical ? el.scrollTop : el.scrollLeft
        if (Math.abs(current - expected) <= 1) return
        if (vertical) el.scrollTop = expected
        else el.scrollLeft = expected
      },

      invokeOnLoadMore({ prop, event, send }) {
        const reason: LoadMoreReason | undefined = event.reason
        if (!reason) return

        const result = prop("onLoadMore")?.({ edge: prop("edge"), reason })

        // When `loading` is controlled the consumer decides when the load ends.
        if (prop("loading") !== undefined) return

        if (!isPromise(result)) {
          send({ type: "LOAD.DONE" })
          return
        }

        result.then(
          () => send({ type: "LOAD.DONE" }),
          (error) => {
            send({ type: "LOAD.DONE" })
            queueMicrotask(() => {
              throw error
            })
          },
        )
      },

      announceItemsLoaded(params) {
        const { prop, refs } = params
        const count = prop("count")
        const delta = count - refs.get("prevCount")
        refs.set("prevCount", count)
        if (delta <= 0) return
        announce(params, prop("translations").itemsLoaded?.(delta))
      },

      announceComplete(params) {
        if (params.prop("hasMore")) return
        announce(params, params.prop("translations").complete)
      },
    },

    effects: {
      trackLiveRegion({ refs, scope }) {
        const liveRegion = createLiveRegion({ level: "polite", document: scope.getDoc() })
        refs.set("liveRegion", liveRegion)
        return () => liveRegion.destroy()
      },

      trackSentinelVisibility(params) {
        // The sentinel may render after the state is entered (e.g. Vue flushes DOM later)
        return raf(() => observeSentinel(params))
      },
    },
  },
})

function observeSentinel({ scope, prop, send }: InfiniteScrollParams) {
  const sentinelEl = dom.getSentinelEl(scope)
  if (!sentinelEl) return

  const win = scope.getWin()
  if (!win.IntersectionObserver) return

  const root = getObserverRoot(scope, prop("scrollEl"))
  const scrollerEl = getScrollingElement(root, scope.getDoc())
  warnIfUnreachable(root)

  const observer = new win.IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      send({
        type: "SENTINEL.INTERSECT",
        reason: getLoadReason(prop, scrollerEl),
      })
    },
    {
      root,
      rootMargin: getRootMargin({
        offset: prop("offset"),
        orientation: prop("orientation"),
        edge: prop("edge"),
        dir: prop("dir"),
      }),
    },
  )

  observer.observe(sentinelEl)
  return () => observer.disconnect()
}

/* -----------------------------------------------------------------------------
 * Helpers
 * -----------------------------------------------------------------------------*/

function didGrow({ prop, refs }: Pick<InfiniteScrollParams, "prop" | "refs">) {
  const start = refs.get("countAtLoadStart")
  if (start === null) return true
  return prop("count") > start
}

function getLoadReason(prop: InfiniteScrollParams["prop"], el: HTMLElement | null): LoadMoreReason {
  if (!el) return "scroll"
  const vertical = prop("orientation") === "vertical"
  const viewportSize = vertical ? el.clientHeight : el.clientWidth
  const contentSize = vertical ? el.scrollHeight : el.scrollWidth
  return viewportSize > 0 && contentSize <= viewportSize ? "autofill" : "scroll"
}

// `null` means the page viewport
function getObserverRoot(scope: InfiniteScrollParams["scope"], scrollEl?: (() => HTMLElement | null) | undefined) {
  return scrollEl?.() ?? resolveScroller(dom.getSentinelEl(scope))
}

function getScrollerEl(scope: InfiniteScrollParams["scope"], scrollEl?: (() => HTMLElement | null) | undefined) {
  return getScrollingElement(getObserverRoot(scope, scrollEl), scope.getDoc())
}

const KEYBOARD_ROLE_RE = /^(listbox|grid|treegrid|tree|menu|table|dialog|application)$/

const warnedContainers = new WeakSet<HTMLElement>()

function warnIfUnreachable(el: HTMLElement | null) {
  if (!el) return // `null` is the page, which always scrolls by keyboard
  if (warnedContainers.has(el)) return
  if (el.tabIndex >= 0) return
  const role = el.closest("[role]")?.getAttribute("role")
  if (role && KEYBOARD_ROLE_RE.test(role)) return
  if (getFirstTabbable(el)) return
  warnedContainers.add(el)
  warn(
    `[zag-js/infinite-scroll] The scroll container is not reachable by keyboard. Add \`tabIndex={0}\` to it, or render focusable content inside it.`,
  )
}

function announce(params: InfiniteScrollParams, message: string | undefined) {
  const { refs } = params
  if (!message) return
  refs.get("liveRegion")?.announce(message)
}

const isPromise = (value: unknown): value is Promise<unknown> =>
  typeof (value as Promise<unknown> | undefined)?.then === "function"
