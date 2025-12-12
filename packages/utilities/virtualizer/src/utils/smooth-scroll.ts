export type EasingFunction = (t: number) => number

export interface SmoothScrollOptions {
  /** Duration of the scroll animation in milliseconds */
  duration?: number
  /** Easing function for the animation */
  easing?: EasingFunction
  /** Custom scroll function to use instead of element.scrollTo */
  scrollFunction?: (position: { scrollTop?: number; scrollLeft?: number }) => void
  /** Callback when scroll completes */
  onComplete?: () => void
  /** Callback when scroll is cancelled */
  onCancel?: () => void
}

export interface SmoothScrollResult {
  /** Promise that resolves when scroll completes */
  promise: Promise<void>
  /** Function to cancel the ongoing scroll */
  cancel: () => void
}

// Built-in easing functions
export const easingFunctions = {
  linear: (t: number): number => t,

  easeInQuad: (t: number): number => t * t,
  easeOutQuad: (t: number): number => t * (2 - t),
  easeInOutQuad: (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  easeInCubic: (t: number): number => t * t * t,
  easeOutCubic: (t: number): number => --t * t * t + 1,
  easeInOutCubic: (t: number): number => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),

  easeInQuart: (t: number): number => t * t * t * t,
  easeOutQuart: (t: number): number => 1 - --t * t * t * t,
  easeInOutQuart: (t: number): number => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),

  // Smooth deceleration - good for scroll animations
  easeOutExpo: (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),

  // Spring-like animation
  easeOutBack: (t: number): number => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  },
} as const

/**
 * Perform smooth scrolling with customizable options
 */
export function smoothScrollTo(
  element: Element | Window,
  target: { x?: number; y?: number },
  options: SmoothScrollOptions = {},
): SmoothScrollResult {
  const { duration = 600, easing = easingFunctions.easeOutCubic, scrollFunction, onComplete, onCancel } = options

  let cancelled = false
  let animationId: number | null = null

  // Get current scroll position
  const isWindow = element === window || element === document.documentElement
  const currentX = isWindow
    ? window.pageXOffset || document.documentElement.scrollLeft
    : (element as HTMLElement).scrollLeft
  const currentY = isWindow
    ? window.pageYOffset || document.documentElement.scrollTop
    : (element as HTMLElement).scrollTop

  const startX = currentX
  const startY = currentY
  const targetX = target.x ?? startX
  const targetY = target.y ?? startY

  const deltaX = targetX - startX
  const deltaY = targetY - startY

  // If no movement needed, complete immediately
  if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
    onComplete?.()
    return {
      promise: Promise.resolve(),
      cancel: () => {},
    }
  }

  const startTime = performance.now()

  let resolvePromise: (() => void) | null = null
  let rejectPromise: ((error: Error) => void) | null = null

  const promise = new Promise<void>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })

  const animate = (currentTime: number) => {
    if (cancelled) {
      onCancel?.()
      rejectPromise?.(new Error("Smooth scroll was cancelled"))
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
      // Use native scrollTo
      if (isWindow) {
        window.scrollTo(newX, newY)
      } else {
        ;(element as HTMLElement).scrollLeft = newX
        ;(element as HTMLElement).scrollTop = newY
      }
    }

    if (progress < 1) {
      animationId = requestAnimationFrame(animate)
    } else {
      onComplete?.()
      resolvePromise?.()
    }
  }

  // Start animation
  animationId = requestAnimationFrame(animate)

  const cancel = () => {
    cancelled = true
    if (animationId !== null) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    rejectPromise?.(new Error("Smooth scroll was cancelled"))
  }

  return { promise, cancel }
}
