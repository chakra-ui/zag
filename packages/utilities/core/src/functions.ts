import { isFunction } from "./guard"

export type MaybeFunction<T> = T | (() => T)

export type Nullable<T> = T | null | undefined

export const runIfFn = <T>(
  v: T | undefined,
  ...a: T extends (...a: any[]) => void ? Parameters<T> : never
): T extends (...a: any[]) => void ? NonNullable<ReturnType<T>> : NonNullable<T> => {
  const res = typeof v === "function" ? v(...a) : v
  return res ?? undefined
}

export const cast = <T>(v: unknown): T => v as T

export const identity = (v: VoidFunction) => v()

export const noop = () => {}

export const callAll =
  <T extends (...a: any[]) => void>(...fns: (T | null | undefined)[]) =>
  (...a: Parameters<T>) => {
    fns.forEach(function (fn) {
      fn?.(...a)
    })
  }

export const uuid = /*#__PURE__*/ (() => {
  let id = 0
  return () => {
    id++
    return id.toString(36)
  }
})()

export function match<V extends string | number = string, R = unknown>(
  key: V,
  record: Record<V, R | ((...args: any[]) => R)>,
  ...args: any[]
): R {
  if (key in record) {
    const fn = record[key]
    return isFunction(fn) ? fn(...args) : (fn as any)
  }

  const error = new Error(`No matching key: ${JSON.stringify(key)} in ${JSON.stringify(Object.keys(record))}`)
  Error.captureStackTrace?.(error, match)

  throw error
}

export const tryCatch = <R>(fn: () => R, fallback: () => R) => {
  try {
    return fn()
  } catch (error) {
    if (error instanceof Error) {
      Error.captureStackTrace?.(error, tryCatch)
    }
    return fallback?.()
  }
}

export function throttle<T extends (...args: any[]) => void>(fn: T, wait = 0): T {
  let lastCall = 0
  let timeout: ReturnType<typeof setTimeout> | null = null

  return ((...args: Parameters<T>) => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCall

    if (timeSinceLastCall >= wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      fn(...args)
      lastCall = now
    } else if (!timeout) {
      timeout = setTimeout(() => {
        fn(...args)
        lastCall = Date.now()
        timeout = null
      }, wait - timeSinceLastCall)
    }
  }) as T
}
