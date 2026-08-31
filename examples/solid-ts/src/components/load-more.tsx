import * as infiniteScroll from "@zag-js/infinite-scroll"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, type ParentProps } from "solid-js"
import { Dynamic } from "solid-js/web"

export interface LoadMoreProps {
  count: number
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
  /**
   * Wrapper for the sentinel + indicator. Use `"li"` inside a menu `<ul>`; `"div"` elsewhere.
   * @default "div"
   */
  as?: "div" | "li"
}

/**
 * Owns the infinite-scroll machine and its sentinel. Mount only while the list is visible
 * (e.g. while a menu/select is open) so loading is scoped to that lifetime.
 */
export function LoadMore(props: ParentProps<LoadMoreProps>) {
  const id = createUniqueId()
  const service = useMachine(infiniteScroll.machine, () => ({
    id,
    count: props.count,
    hasMore: props.hasMore,
    loading: props.loading,
    onLoadMore: () => props.onLoadMore(),
  }))
  const api = createMemo(() => infiniteScroll.connect(service, normalizeProps))
  const tag = () => props.as ?? "div"

  return (
    <Dynamic component={tag()} role={tag() === "li" ? "presentation" : undefined}>
      <div {...api().getSentinelProps()} />
      <div {...api().getIndicatorProps({ type: "loading" })} style={{ padding: "8px 12px", "font-size": "13px" }}>
        {props.children ?? "Loading more…"}
      </div>
    </Dynamic>
  )
}
