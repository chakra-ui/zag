export class AnimationFrame {
  static create() {
    return new AnimationFrame()
  }

  private id: number | null = null
  private fn_cleanup: VoidFunction | undefined | void

  request(fn?: VoidFunction | (() => VoidFunction)) {
    this.cancel()
    this.id = globalThis.requestAnimationFrame(() => {
      this.id = null
      this.fn_cleanup = fn?.()
    })
  }

  cancel() {
    if (this.id !== null) {
      globalThis.cancelAnimationFrame(this.id)
      this.id = null
    }
    this.fn_cleanup?.()
    this.fn_cleanup = undefined
  }

  isActive() {
    return this.id !== null
  }

  cleanup = () => {
    this.cancel()
  }
}

export function raf(fn: VoidFunction | (() => VoidFunction)) {
  const frame = AnimationFrame.create()
  frame.request(fn)
  return frame.cleanup
}

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
