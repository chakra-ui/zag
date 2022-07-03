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

type SchedulerFn = (fn: VoidFunction) => VoidFunction
type DisposableVoidFunction = () => VoidFunction | undefined | void

export function disposable(type: SchedulerFn | undefined, fn: DisposableVoidFunction) {
  let cleanup: VoidFunction | undefined | void
  let dispose: VoidFunction | undefined | void
  if (type) {
    dispose = type(() => {
      cleanup = fn()
    })
  } else {
    cleanup = fn()
  }
  return () => {
    cleanup?.()
    dispose?.()
  }
}

export function disposableRaf(fn: DisposableVoidFunction) {
  return disposable(raf, fn)
}

export function disposableNextTick(fn: DisposableVoidFunction) {
  return disposable(nextTick, fn)
}
