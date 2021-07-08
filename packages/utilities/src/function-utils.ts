import { isFunction } from "./assertion-utils"

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

type AnyFunction = (...args: any) => void

// invokes a value if it is a function
export function runIfFn<T>(
  value: T,
  ...args: T extends AnyFunction ? Parameters<T> : never
): T extends AnyFunction ? ReturnType<T> : T {
  return isFunction(value) ? value(...args) : value
}
