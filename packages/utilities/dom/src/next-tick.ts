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

export function forceReflow() {
  return document.body.offsetHeight
}

export const microtask: (v: VoidFunction) => void =
  typeof globalThis.queueMicrotask === "function"
    ? globalThis.queueMicrotask
    : typeof globalThis.Promise !== "undefined"
    ? (fn) =>
        globalThis.Promise.resolve()
          .then(fn)
          .catch((error) => {
            setTimeout(function () {
              throw error
            })
          })
    : globalThis.setTimeout
