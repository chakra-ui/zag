import { getNearestOverflowAncestor } from "@zag-js/dom-query"
import { useEffect, useRef } from "react"

interface UseLoadMoreSentinelOptions {
  collectionKey: unknown
  scrollOffset?: number
  onLoadMore?: () => void
}

export function useLoadMoreSentinel(
  ref: React.RefObject<HTMLElement | null>,
  { collectionKey, scrollOffset = 1, onLoadMore }: UseLoadMoreSentinelOptions,
) {
  const onLoadMoreRef = useRef(onLoadMore)
  onLoadMoreRef.current = onLoadMore

  useEffect(() => {
    const sentinel = ref.current
    if (!sentinel) return

    const root = getNearestOverflowAncestor(sentinel)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onLoadMoreRef.current?.()
        }
      },
      {
        root,
        rootMargin: `0px ${100 * scrollOffset}% ${100 * scrollOffset}% ${100 * scrollOffset}%`,
      },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [ref, collectionKey, scrollOffset])
}
