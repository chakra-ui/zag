type Booleanish = boolean | "true" | "false"

export const dataAttr = (guard: boolean | undefined) => {
  return (guard ? "" : undefined) as Booleanish
}

export const ariaAttr = (guard: boolean | undefined) => {
  return guard ? true : undefined
}

export const nextTick = (fn: VoidFunction) => {
  const set = new Set<VoidFunction>()
  function raf(fn: VoidFunction) {
    const id = globalThis.requestAnimationFrame(fn)
    set.add(() => globalThis.cancelAnimationFrame(id))
  }
  raf(() => raf(fn))
  return function cleanup() {
    set.forEach(function (fn) {
      fn()
    })
  }
}

export * from "./keyboard-event"
export * from "./query"
export * from "./sr-only"
