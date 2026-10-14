import { type ParentProps } from "solid-js"
import { Dynamic } from "solid-js/web"
import { useInfiniteScroll } from "~/hooks/use-infinite-scroll"

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
  const api = useInfiniteScroll(() => ({
    count: props.count,
    hasMore: props.hasMore,
    loading: props.loading,
    onLoadMore: () => props.onLoadMore(),
  }))
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
