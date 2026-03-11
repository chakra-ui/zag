import type { Service } from "@zag-js/core"
import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes, Rect } from "@zag-js/types"
import { toPx } from "@zag-js/utils"
import { parts } from "./toc.anatomy"
import * as dom from "./toc.dom"
import type { ItemProps, ItemState, TocApi, TocSchema } from "./toc.types"

export function connect<T extends PropTypes>(service: Service<TocSchema>, normalize: NormalizeProps<T>): TocApi<T> {
  const { send, context, scope, computed, prop } = service

  const activeId = computed("activeId")
  const items = computed("resolvedItems")
  const activeIds = context.get("activeIds")
  const activeSet = new Set(activeIds)
  const firstActiveId = activeIds[0] ?? null
  const lastActiveId = activeIds[activeIds.length - 1] ?? null

  function getItemState(props: ItemProps): ItemState {
    const item = items.find((i) => i.value === props.value)
    return {
      active: activeSet.has(props.value),
      first: props.value === firstActiveId,
      last: props.value === lastActiveId,
      depth: item?.depth ?? 2,
    }
  }

  return {
    activeId,
    activeIds,
    items,

    scrollToHeading(value) {
      send({ type: "HEADING.SCROLL_TO", value })
    },

    setActiveIds(value) {
      send({ type: "ACTIVE_IDS.SET", value })
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
      const { value } = props
      const itemState = getItemState(props)

      return normalize.element({
        ...parts.item.attrs,
        id: dom.getItemId(scope, value),
        dir: prop("dir"),
        "data-value": value,
        "data-depth": String(itemState.depth),
        "data-active": dataAttr(itemState.active),
        "data-first": dataAttr(itemState.first),
        "data-last": dataAttr(itemState.last),
        style: {
          "--depth": itemState.depth,
        },
      })
    },

    getItemLinkProps(props) {
      const { value } = props
      const itemState = getItemState({ value })

      return normalize.element({
        ...parts.link.attrs,
        id: dom.getLinkId(scope, value),
        dir: prop("dir"),
        "data-value": value,
        "data-active": dataAttr(itemState.active),
        "aria-current": itemState.active ? "location" : undefined,
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
