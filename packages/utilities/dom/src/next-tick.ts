export function nextTick(fn: VoidFunction) {
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

export function raf(fn: VoidFunction) {
  const id = globalThis.requestAnimationFrame(fn)
  return function cleanup() {
    globalThis.cancelAnimationFrame(id)
  }
}

export function sandbox(type: typeof raf | undefined, fn: () => VoidFunction | undefined | void) {
  let cleanup: VoidFunction | undefined | void
  if (type) {
    type(() => {
      cleanup = fn()
    })
  } else {
    cleanup = fn()
  }
  return () => {
    cleanup?.()
  }
}
