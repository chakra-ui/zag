type AnyFunction = (...args: any[]) => any

export function debounce<T extends AnyFunction>(fn: T, ms: number) {
  let last = 0
  let timeout: any = null
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - last > ms) {
      fn(...args)
      last = now
    } else {
      clearTimeout(timeout)

      timeout = setTimeout(
        () => {
          fn(...args)
          last = Date.now()
        },
        Math.max(0, ms - now + last),
      )
    }
  }
}
