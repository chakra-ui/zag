import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./infinite-scroll.anatomy"
import * as dom from "./infinite-scroll.dom"
import type { InfiniteScrollApi, InfiniteScrollService, Status } from "./infinite-scroll.types"

export function connect<T extends PropTypes>(
  service: InfiniteScrollService,
  normalize: NormalizeProps<T>,
): InfiniteScrollApi<T> {
  const { send, prop, state, scope } = service

  const loading = prop("loading") ?? state.matches("loading")
  const hasMore = prop("hasMore")
  // `complete` outranks `loading`: a list with nothing left to load is not loading, even if a
  // controlled `loading` prop lags behind `hasMore`.
  const status: Status = !hasMore ? "complete" : loading ? "loading" : "idle"
  const orientation = prop("orientation")
  const edge = prop("edge")

  return {
    status,
    loading,
    hasMore,

    loadMore() {
      send({ type: "LOAD.REQUESTED", reason: "manual" })
    },

    reset() {
      send({ type: "RESET" })
    },

    getSentinelProps() {
      return normalize.element({
        ...parts.sentinel.attrs(scope.id),
        id: dom.getSentinelId(scope),
        "data-edge": edge,
        "aria-hidden": true,
        inert: true,
        // Non-zero box (IntersectionObserver is unreliable for zero-size elements),
        // cancelled back out of layout by the negative end margin.
        style: {
          flexShrink: 0,
          pointerEvents: "none",
          ...(orientation === "vertical"
            ? { width: "100%", height: "1px", marginBlockEnd: "-1px" }
            : { width: "1px", height: "100%", marginInlineEnd: "-1px" }),
        },
      })
    },

    getIndicatorProps(props) {
      return normalize.element({
        ...parts.indicator.attrs(scope.id),
        "data-type": props.type,
        "data-state": status,
        hidden: status !== props.type,
      })
    },
  }
}
