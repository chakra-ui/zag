export class AnimationFrame {
  static create() {
    return new AnimationFrame()
  }

  private id: number | null = null
  private cleanupFn: VoidFunction | undefined | void

  request(fn?: VoidFunction | (() => VoidFunction)) {
    this.cancel()
    this.id = globalThis.requestAnimationFrame(() => {
      this.id = null
      this.cleanupFn = fn?.()
    })
  }

  cancel = () => {
    if (this.id !== null) {
      globalThis.cancelAnimationFrame(this.id)
      this.id = null
    }
    this.cleanupFn?.()
    this.cleanupFn = undefined
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

/** Calls `fn` two frames from now, after the next paint */
export function nextTick(fn: VoidFunction) {
  const cancels = new Set<VoidFunction>()
  const request = (callback: VoidFunction) => {
    const id = globalThis.requestAnimationFrame(callback)
    cancels.add(() => globalThis.cancelAnimationFrame(id))
  }
  request(() => request(fn))
  return function cleanup() {
    cancels.forEach((cancel) => cancel())
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
