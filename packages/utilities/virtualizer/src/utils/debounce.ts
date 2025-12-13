/**
 * Debounce function with immediate option
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options: { immediate?: boolean } = {},
): T & { cancel: () => void; flush: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: any[] | null = null
  let lastThis: any = null
  let result: any

  const debounced = function (this: any, ...args: any[]) {
    lastArgs = args
    lastThis = this

    const callNow = options.immediate && !timeoutId

    const later = () => {
      timeoutId = null
      if (!options.immediate && lastArgs) {
        result = fn.apply(lastThis, lastArgs)
        lastArgs = null
        lastThis = null
      }
    }

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(later, delay)

    if (callNow) {
      result = fn.apply(this, args)
    }

    return result
  } as T & { cancel: () => void; flush: () => void }

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    lastArgs = null
    lastThis = null
  }

  debounced.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId)
      result = fn.apply(lastThis, lastArgs)
      timeoutId = null
      lastArgs = null
      lastThis = null
    }
  }

  return debounced
}

/**
 * RequestAnimationFrame-based throttle for smooth scroll handling
 */
export function rafThrottle<T extends (...args: any[]) => any>(fn: T): T & { cancel: () => void } {
  let rafId: number | null = null
  let lastArgs: any[] | null = null
  let lastThis: any = null

  const throttled = function (this: any, ...args: any[]) {
    lastArgs = args
    lastThis = this

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          fn.apply(lastThis, lastArgs)
        }
        rafId = null
        lastArgs = null
        lastThis = null
      })
    }
  } as T & { cancel: () => void }

  throttled.cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    lastArgs = null
    lastThis = null
  }

  return throttled
}
