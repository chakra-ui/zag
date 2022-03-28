export const runIfFn = <T>(
  v: T,
  ...a: T extends (...a: any[]) => void ? Parameters<T> : never
): T extends (...a: any[]) => void ? NonNullable<ReturnType<T>> | undefined : NonNullable<T> | undefined => {
  const res = typeof v === "function" ? v(...a) : v
  return res ?? undefined
}

export const cast = <T>(v: unknown): T => v as T

export const noop = () => {}

export const pipe =
  <T>(...fns: Array<(a: T) => T>) =>
  (v: T) =>
    fns.reduce((a, b) => b(a), v)

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

export function merge<T, U>(origin: T, patch: U): T & U {
  if (!(typeof patch === "object")) return patch as any
  const result = !(typeof origin === "object") ? {} : Object.assign({}, origin)
  for (const key of Object.keys(patch)) {
    const value = patch[key]
    const src = result[key]
    if (value === null) delete result[key]
    else if (Array.isArray(value) || Array.isArray(src)) result[key] = (src || []).concat(value || [])
    else result[key] = merge(src, value)
  }
  return result as any
}
