import { getNearestScrollableAncestor, getWindow } from "@zag-js/dom-query"

export interface InfiniteScrollOptions {
  /**
   * The sentinel element to observe (placed at the end of the list).
   */
  sentinelEl: HTMLElement | (() => HTMLElement | null)
  /**
   * The scrollable container. If not provided, the nearest scroll parent of
   * the sentinel is used.
   */
  scrollerEl?: HTMLElement | (() => HTMLElement | null)
  /**
   * Called when the sentinel enters the viewport.
   */
  onLoadMore: () => void
  /**
   * Whether more data is available. When false, observer disconnects.
   * @default true
   */
  hasMore?: boolean
  /**
   * Whether a load is currently in progress. Prevents duplicate calls.
   * @default false
   */
  loading?: boolean
  /**
   * How far before the sentinel is visible to trigger loading.
   * - `number` is interpreted as pixels (e.g. `200` → `"200px"`).
   * - `string` accepts any valid CSS margin token, including percentages
   *   relative to the root (e.g. `"50%"`, `"200px"`, `"10% 0px"`).
   * @default "200px"
   */
  threshold?: number | string
  /**
   * Whether loading is paused (e.g., on error). Set to true to stop,
   * false to resume.
   * @default false
   */
  disabled?: boolean
}

type ElementOrGetter = HTMLElement | (() => HTMLElement | null) | undefined

const resolveEl = (el: ElementOrGetter): HTMLElement | null => {
  if (!el) return null
  return typeof el === "function" ? el() : el
}

const formatRootMargin = (threshold: number | string): string => {
  const value = typeof threshold === "number" ? `${threshold}px` : threshold
  return `${value} ${value} ${value} ${value}`
}

const noop = () => {}

export function createInfiniteScroll(options: InfiniteScrollOptions): () => void {
  const {
    sentinelEl,
    scrollerEl,
    onLoadMore,
    hasMore = true,
    loading = false,
    threshold = "200px",
    disabled = false,
  } = options

  const sentinel = resolveEl(sentinelEl)
  if (!sentinel) return noop
  if (!hasMore || disabled) return noop

  const win = getWindow(sentinel)
  if (typeof win.IntersectionObserver === "undefined") return noop

  // null root = page viewport. Falling back to the nearest scrollable
  // ancestor matches the spec; if none exists, IO defaults to the viewport.
  const root = resolveEl(scrollerEl) ?? getNearestScrollableAncestor(sentinel)

  const observer = new win.IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !loading && hasMore && !disabled) {
          onLoadMore()
          break
        }
      }
    },
    {
      root,
      rootMargin: formatRootMargin(threshold),
    },
  )

  observer.observe(sentinel)

  return () => observer.disconnect()
}

export interface SentinelProps {
  "aria-hidden": true
  inert: boolean
  style: {
    width: string
    height: string
    flexShrink: number
    pointerEvents: "none"
  }
}

/**
 * Returns props for the sentinel element.
 *
 * The sentinel must have non-zero size for `IntersectionObserver` to fire
 * reliably across browsers. It is hidden from assistive tech and the
 * focus order, and cannot intercept pointer events.
 */
export function getSentinelProps(): SentinelProps {
  return {
    "aria-hidden": true,
    inert: true,
    style: {
      width: "1px",
      height: "1px",
      flexShrink: 0,
      pointerEvents: "none",
    },
  }
}
