export type EasingFunction = (t: number) => number

export interface ScrollUntilOptions {
  easing?: EasingFunction | undefined
  duration?: number | undefined
  targetScrollTop?: number | undefined
  targetScrollLeft?: number | undefined
  onProgress?: ((progress: number) => void) | undefined
  onComplete?: ((success: boolean) => void) | undefined
}

export function scrollUntil(
  element: HTMLElement,
  condition: () => boolean,
  options: ScrollUntilOptions = {},
): Promise<boolean> {
  const {
    easing = (t: number) => t, // linear by default
    duration = 300,
    targetScrollTop,
    targetScrollLeft,
    onProgress,
    onComplete,
  } = options

  const startTime = performance.now()
  const startScrollTop = element.scrollTop
  const startScrollLeft = element.scrollLeft

  async function animate(): Promise<boolean> {
    return new Promise(requestAnimationFrame).then(() => {
      if (condition()) {
        onComplete?.(true)
        return true
      }

      const elapsed = performance.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easing(progress)

      if (targetScrollTop !== undefined) {
        element.scrollTop = startScrollTop + (targetScrollTop - startScrollTop) * easedProgress
      }

      if (targetScrollLeft !== undefined) {
        element.scrollLeft = startScrollLeft + (targetScrollLeft - startScrollLeft) * easedProgress
      }

      onProgress?.(progress)

      if (progress < 1) {
        return animate()
      }

      onComplete?.(condition())
      return condition()
    })
  }

  return animate()
}
