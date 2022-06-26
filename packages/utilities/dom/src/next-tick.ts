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

export function queueMicrotask(fn: VoidFunction) {
  if (typeof globalThis.queueMicrotask === "function") {
    globalThis.queueMicrotask(fn)
  } else {
    Promise.resolve().then(fn)
  }
}

export function queueBeforeEvent(el: Element, type: string, fn: VoidFunction) {
  const cleanup = raf(() => {
    el.removeEventListener(type, invoke, true)
    fn()
  })

  const invoke = () => {
    cleanup()
    fn()
  }

  el.addEventListener(type, invoke, { once: true, capture: true })
}
