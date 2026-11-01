"use client"

import { type ReactNode } from "react"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"

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
  children?: ReactNode
}

/**
 * Owns the infinite-scroll machine and its sentinel. Mount only while the list is visible
 * (e.g. while a menu/select is open) so loading is scoped to that lifetime.
 */
export function LoadMore(props: LoadMoreProps) {
  const { as: Comp = "div", children = "Loading more…", count, hasMore, loading, onLoadMore } = props
  const api = useInfiniteScroll({ count, hasMore, loading, onLoadMore })

  return (
    <Comp {...(Comp === "li" ? { role: "presentation" as const } : null)}>
      <div {...api.getSentinelProps()} />
      <div {...api.getIndicatorProps({ type: "loading" })} style={{ padding: "8px 12px", fontSize: 13 }}>
        {children}
      </div>
    </Comp>
  )
}
