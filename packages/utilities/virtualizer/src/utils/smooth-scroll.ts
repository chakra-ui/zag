import { AnimationFrame } from "@zag-js/dom-query"
import { getScrollPosition, setScrollPosition, type ScrollTarget } from "./scroll-helpers"

export type EasingFunction = (t: number) => number

export interface SmoothScrollOptions {
  /** Duration of the scroll animation in milliseconds */
  duration?: number
  /** Easing function for the animation */
  easing?: EasingFunction
  /** Custom scroll function to use instead of element.scrollTo */
  scrollFunction?: (position: { scrollTop?: number; scrollLeft?: number }) => void
  /** Callback when scroll completes */
  onComplete?: VoidFunction
  /** Callback when scroll is cancelled */
  onCancel?: VoidFunction
}

export interface SmoothScrollResult {
  /** Promise that resolves when scroll completes */
  promise: Promise<void>
  /** Function to cancel the ongoing scroll */
  cancel: VoidFunction
}

const easeOutCubic = (t: number): number => --t * t * t + 1

export function smoothScrollTo(
  element: Element | Window,
  target: { x?: number; y?: number },
  options: SmoothScrollOptions = {},
): SmoothScrollResult {
  const { duration = 600, easing = easeOutCubic, scrollFunction, onComplete, onCancel } = options

  let cancelled = false
  const hasRAF =
    typeof globalThis.requestAnimationFrame === "function" && typeof globalThis.cancelAnimationFrame === "function"
  const frame = hasRAF ? AnimationFrame.create() : null

  const targetEl = element as ScrollTarget

  // Get current scroll position
  const current = getScrollPosition(targetEl)
  const currentX = current.scrollLeft
  const currentY = current.scrollTop

  const startX = currentX
  const startY = currentY
  const targetX = target.x ?? startX
  const targetY = target.y ?? startY

  const deltaX = targetX - startX
  const deltaY = targetY - startY

  // If RAF isn't available, fall back to an instant scroll (no polyfill).
  if (!hasRAF) {
    if (scrollFunction) {
      scrollFunction({ scrollLeft: targetX, scrollTop: targetY })
    } else {
      setScrollPosition(targetEl, { scrollLeft: targetX, scrollTop: targetY })
    }

    onComplete?.()
    return {
      promise: Promise.resolve(),
      cancel: () => {},
    }
  }

  // If no movement needed, complete immediately
  if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
    onComplete?.()
    return {
      promise: Promise.resolve(),
      cancel: () => {},
    }
  }

  const startTime = performance.now()

  let resolvePromise: VoidFunction | null = null

  const promise = new Promise<void>((resolve) => {
    resolvePromise = resolve
  })

  const animate = (currentTime: number) => {
    if (cancelled) {
      onCancel?.()
      // Cancellation is an expected control-flow event (e.g. starting a new scroll).
      // Treat it as a normal completion to avoid unhandled promise rejections.
      resolvePromise?.()
      return
    }

    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easing(progress)

    const newX = startX + deltaX * easedProgress
    const newY = startY + deltaY * easedProgress

    // Use custom scroll function if provided
    if (scrollFunction) {
      scrollFunction({
        scrollLeft: newX,
        scrollTop: newY,
      })
    } else {
      setScrollPosition(targetEl, { scrollLeft: newX, scrollTop: newY })
    }

    if (progress < 1) {
      frame!.request(() => {
        // `AnimationFrame` doesn't pass a timestamp. Use `performance.now()`.
        animate(performance.now())
      })
    } else {
      onComplete?.()
      resolvePromise?.()
    }
  }

  // Start animation
  frame!.request(() => {
    animate(performance.now())
  })

  const cancel = () => {
    cancelled = true
    frame!.cancel()
    onCancel?.()
    // See note above: cancellation is not exceptional.
    resolvePromise?.()
  }

  return { promise, cancel }
}
