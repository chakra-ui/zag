import { useEffect, useRef } from "react"

interface UseSentinelObserverOptions {
  getSentinel: () => HTMLElement | null
  onIntersect: () => void
  rootRef?: React.RefObject<Element | null>
  threshold?: number
}

export function useSentinelObserver(options: UseSentinelObserverOptions) {
  const onIntersectRef = useRef(options.onIntersect)
  onIntersectRef.current = options.onIntersect

  useEffect(() => {
    const sentinel = options.getSentinel()
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onIntersectRef.current()
      },
      {
        root: options.rootRef?.current ?? null,
        threshold: options.threshold ?? 0.1,
      },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])
}
