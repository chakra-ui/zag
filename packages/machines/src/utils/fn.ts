export const runIfFn = <T>(
  v: T,
  ...a: T extends (...a: any[]) => void ? Parameters<T> : never
): T extends (...a: any[]) => void ? ReturnType<T> : T => {
  return typeof v === "function" ? v(...a) : v
}

export const noop = () => {}

export const pipe =
  <T>(...fns: Array<(a: T) => T>) =>
  (v: T) =>
    fns.reduce((a, b) => b(a), v)

export const cast = <T>(v: unknown) => v as T

export const nextTick = (fn: VoidFunction) => {
  const set = new Set<VoidFunction>()
  function raf(fn: VoidFunction) {
    const id = requestAnimationFrame(fn)
    set.add(() => cancelAnimationFrame(id))
  }
  raf(() => raf(fn))
  return function cleanup() {
    set.forEach(function (fn) {
      fn()
    })
  }
}

export const callAll =
  <T extends (...a: any[]) => void>(...fns: (T | undefined)[]) =>
  (...a: Parameters<T>) => {
    fns.forEach(function (fn) {
      fn?.(...a)
    })
  }

export function warn(m: string): void
export function warn(c: boolean, m: string): void
export function warn(...a: any[]): void {
  const m = a.length === 1 ? a[0] : a[1]
  const c = a.length === 2 ? a[0] : true
  if (c && process.env.NODE_ENV !== "production") {
    console.warn(m)
  }
}

export function invariant(m: string): void
export function invariant(c: boolean, m: string): void
export function invariant(...a: any[]): void {
  const m = a.length === 1 ? a[0] : a[1]
  const c = a.length === 2 ? a[0] : true
  if (c && process.env.NODE_ENV !== "production") {
    throw new Error(m)
  }
}
