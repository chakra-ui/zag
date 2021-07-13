import { isFunction } from "./assertion"
import { __DEV__ } from "./env"

// schedule task to next tick using double `requestAnimationFrame`
export function nextTick(fn: VoidFunction) {
  const cleanup = new Set<VoidFunction>()

  function raf(fn: VoidFunction) {
    const id = requestAnimationFrame(fn)
    cleanup.add(() => cancelAnimationFrame(id))
  }

  raf(() => raf(fn))

  return () => {
    cleanup.forEach((fn) => fn())
  }
}

export type AnyFunction = (...args: any[]) => void

export type MaybeFunction<T, Args extends any[] = []> =
  | T
  | ((...args: Args) => T)

// invokes a value if it is a function
export function runIfFn<T>(
  value: T,
  ...args: T extends AnyFunction ? Parameters<T> : never
): T extends AnyFunction ? ReturnType<T> : T {
  return isFunction(value) ? value(...args) : value
}

export const cast = <T>(value: unknown) => value as T

export function once<T extends AnyFunction>(fn: T) {
  let called = false
  function exec(...args: Parameters<T>) {
    if (called) return
    called = true
    return fn(...args)
  }
  return exec as T
}

export const noop = () => {}

export function warn(message: string): void
export function warn(condition: boolean, message: string): void
export function warn(...args: any[]): void {
  const message = args.length === 1 ? args[0] : args[1]
  const condition = args.length === 2 ? args[0] : true

  once(() => {
    if (condition && __DEV__) {
      console.warn(message)
    }
  })
}

/**
 * Compose multiple functions, from right-to-left into a single function
 * ```jsx
 * import { pipe } from "@chakra-ui/function-utils"
 *
 * const getName = (p) => p.name;
 * const getLength = (str) => str.length;
 *
 * const fn = pipe(getName, getLength)
 * const result = fn({ name: 'Sage' }) // => 4
 * ```
 */
export const pipe =
  <T>(...fns: Array<(a: T) => T>) =>
  (v: T) =>
    fns.reduce((a, b) => b(a), v)

/**
 * Generates a unique id
 */
export const uuid = (() => {
  let count = 0
  return () => {
    count++
    return count.toString(36).substr(2, 9)
  }
})()
