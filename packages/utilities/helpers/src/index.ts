export const runIfFn = <T>(v: T, ...a: T extends (...a: any[]) => void ? Parameters<T> : never): T extends (...a: any[]) => void ? ReturnType<T> : T => {
  return typeof v === "function" ? v(...a) : v
}

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

export const uuid = (() => {
  let id = 0
  return () => {
    id++
    return id.toString(36)
  }
})()
