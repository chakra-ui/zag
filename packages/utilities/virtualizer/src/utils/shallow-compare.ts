/**
 * Shallow comparison of two objects
 * Returns true if objects are equal at the first level
 */
export function shallowCompare<T extends Record<string, any>>(a: T, b: T): boolean {
  if (a === b) return true
  if (!a || !b) return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (a[key] !== b[key]) return false
  }

  return true
}

/**
 * Memoize a function with shallow comparison of arguments
 */
export function memoShallow<T extends (...args: any[]) => any>(fn: T): T {
  let lastArgs: any[] | undefined
  let lastResult: any

  return ((...args: any[]) => {
    if (!lastArgs || !shallowArrayCompare(args, lastArgs)) {
      lastArgs = args
      lastResult = fn(...args)
    }
    return lastResult
  }) as T
}

/**
 * Shallow comparison of two arrays
 */
function shallowArrayCompare<T>(a: T[], b: T[]): boolean {
  if (a === b) return true
  if (!a || !b) return false
  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }

  return true
}
