import type { Service } from "@zag-js/core"
import { dataAttr, getWindow, isDownloadingEvent, isOpeningInNewTab, scrollToElement } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes, Rect } from "@zag-js/types"
import { first, last, toPx } from "@zag-js/utils"
import { parts } from "./toc.anatomy"
import * as dom from "./toc.dom"
import type { ItemProps, ItemState, ScrollToDetails, TocApi, TocSchema } from "./toc.types"

export function connect<T extends PropTypes>(service: Service<TocSchema>, normalize: NormalizeProps<T>): TocApi<T> {
  const { send, context, scope, computed, prop } = service

  const items = prop("items")
  const activeItems = computed("activeItems")
  const activeIds = context.get("activeIds")

  const firstActiveId = first(activeIds)
  const lastActiveId = last(activeIds)

  function scrollTo(value: string, details?: ScrollToDetails) {
    const headingEl = dom.getHeadingEl(scope, value)
    if (!headingEl) return false

    const behavior = details?.behavior ?? prop("scrollBehavior")
    const scrollEl = prop("scrollEl")?.()
    if (!scrollEl) {
      headingEl.scrollIntoView({ behavior, block: "start" })
      return true
    }

    return scrollToElement(headingEl, { rootEl: scrollEl, behavior })
  }

  function getItemState(props: ItemProps): ItemState {
    const { item } = props
    return {
      active: activeIds.includes(item.value),
      first: item.value === firstActiveId,
      last: item.value === lastActiveId,
      depth: item.depth,
    }
  }

  return {
    activeIds,
    activeItems,
    items,

    setActiveIds(value) {
      send({ type: "ACTIVE_IDS.SET", value })
    },

    scrollTo(value, details) {
      scrollTo(value, details)
    },

    getItemState,

    getRootProps() {
      const rect = context.get("indicatorRect")
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        dir: prop("dir"),
        "aria-labelledby": dom.getTitleId(scope),
        style: {
          "--top": toPx(rect?.y),
          "--left": toPx(rect?.x),
          "--width": toPx(rect?.width),
          "--height": toPx(rect?.height),
        },
      })
    },

    getTitleProps() {
      return normalize.element({
        ...parts.title.attrs,
        id: dom.getTitleId(scope),
        dir: prop("dir"),
      })
    },

    getListProps() {
      return normalize.element({
        ...parts.list.attrs,
        id: dom.getListId(scope),
        dir: prop("dir"),
      })
    },

    getItemProps(props) {
      const { item } = props
      const itemState = getItemState(props)

      return normalize.element({
        ...parts.item.attrs,
        id: dom.getItemId(scope, item.value),
        dir: prop("dir"),
        "data-value": item.value,
        "data-depth": String(itemState.depth),
        "data-active": dataAttr(itemState.active),
        "data-first": dataAttr(itemState.first),
        "data-last": dataAttr(itemState.last),
        style: {
          "--depth": itemState.depth,
        },
      })
    },

    getLinkProps(props) {
      const { item } = props
      const itemState = getItemState(props)

      return normalize.element({
        ...parts.link.attrs,
        id: dom.getLinkId(scope, item.value),
        dir: prop("dir"),
        "data-value": item.value,
        "data-active": dataAttr(itemState.active),
        "aria-current": itemState.active ? "location" : undefined,
        onClick(event) {
          const scrollEl = prop("scrollEl")?.()
          if (!scrollEl) return

          if (event.defaultPrevented) return
          if (isDownloadingEvent(event)) return
          if (isOpeningInNewTab(event)) return

          const value = getSamePageHash(event.currentTarget)
          if (!value) return

          const scrolled = scrollTo(value)
          if (!scrolled) return

          event.preventDefault()
          pushHash(scope.getWin(), value)
        },
      })
    },

    getIndicatorProps() {
      const rect = context.get("indicatorRect")

      return normalize.element({
        ...parts.indicator.attrs,
        id: dom.getIndicatorId(scope),
        hidden: isRectEmpty(rect),
        style: {
          position: "absolute",
        },
      })
    },
  }
}

const isRectEmpty = (rect: Rect | null) =>
  rect == null || (rect.width === 0 && rect.height === 0 && rect.x === 0 && rect.y === 0)

const getSamePageHash = (el: HTMLElement) => {
  const href = el.getAttribute("href")
  if (!href) return null
  const win = getWindow(el)

  const url = new win.URL(href, win.location.href)
  if (url.origin !== win.location.origin) return null
  if (url.pathname !== win.location.pathname) return null
  if (url.search !== win.location.search) return null

  try {
    return decodeURIComponent(url.hash.slice(1)) || null
  } catch {
    return null
  }
}

const pushHash = (win: typeof window, value: string) => {
  const oldURL = win.location.href
  win.history.pushState(null, "", `#${value}`)
  win.dispatchEvent(new win.HashChangeEvent("hashchange", { oldURL, newURL: win.location.href }))
}
