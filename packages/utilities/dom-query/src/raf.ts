export function nextTick(fn: VoidFunction) {
  const set = new Set<VoidFunction>()
  function raf(fn: VoidFunction) {
    const id = globalThis.requestAnimationFrame(fn)
    set.add(() => globalThis.cancelAnimationFrame(id))
  }
  raf(() => raf(fn))
  return function cleanup() {
    set.forEach((fn) => fn())
  }
}

export function raf(fn: VoidFunction | (() => VoidFunction)) {
  let cleanup: VoidFunction | undefined | void
  const id = globalThis.requestAnimationFrame(() => {
    cleanup = fn()
  })
  return () => {
    globalThis.cancelAnimationFrame(id)
    cleanup?.()
  }
}

export function queueBeforeEvent(el: EventTarget, type: string, cb: () => void) {
  const cancelTimer = raf(() => {
    el.removeEventListener(type, exec, true)
    cb()
  })
  const exec = () => {
    cancelTimer()
    cb()
  }
  el.addEventListener(type, exec, { once: true, capture: true })
  return cancelTimer
}
