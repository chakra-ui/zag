export const runIfFn = <T>(
  v: T | undefined,
  ...a: T extends (...a: any[]) => void ? Parameters<T> : never
): T extends (...a: any[]) => void ? NonNullable<ReturnType<T>> : NonNullable<T> => {
  const res = typeof v === "function" ? v(...a) : v
  return res ?? undefined
}

export const cast = <T>(v: unknown): T => v as T

export const noop = () => {}

export const callAll =
  <T extends (...a: any[]) => void>(...fns: (T | undefined)[]) =>
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
