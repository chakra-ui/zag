/** A `setTimeout` with one pending call. Starting again replaces the pending call. */
export class Timeout {
  static create() {
    return new Timeout()
  }

  private id: ReturnType<typeof setTimeout> | null = null

  start(delay: number, fn: VoidFunction) {
    this.cancel()
    this.id = setTimeout(() => {
      this.id = null
      fn()
    }, delay)
  }

  isActive() {
    return this.id !== null
  }

  cancel = () => {
    if (this.id === null) return
    clearTimeout(this.id)
    this.id = null
  }
}

/**
 * A timeout measured on animation frames, so it never fires while the tab is hidden.
 * Use it for timing the user should see, like a toast's duration.
 */
export class AnimationFrameTimeout {
  static create() {
    return new AnimationFrameTimeout()
  }

  private id: number | null = null

  start(delay: number, fn: VoidFunction) {
    this.cancel()
    const startMs = performance.now()
    const tick = (now: number) => {
      if (now - startMs < delay) {
        this.id = globalThis.requestAnimationFrame(tick)
        return
      }
      this.id = null
      fn()
    }
    this.id = globalThis.requestAnimationFrame(tick)
  }

  isActive() {
    return this.id !== null
  }

  cancel = () => {
    if (this.id === null) return
    globalThis.cancelAnimationFrame(this.id)
    this.id = null
  }
}

/** An interval measured on animation frames, so it never fires while the tab is hidden */
export class AnimationFrameInterval {
  static create() {
    return new AnimationFrameInterval()
  }

  private id: number | null = null

  /** Calls `fn` with the time since the previous call */
  start(interval: number, fn: (deltaMs: number) => void) {
    this.cancel()
    let startMs = performance.now()
    const tick = (now: number) => {
      // Schedule first, so `fn` can cancel
      this.id = globalThis.requestAnimationFrame(tick)
      const deltaMs = now - startMs
      if (deltaMs < interval) return
      // Keep the remainder so the ticks don't drift
      startMs = interval > 0 ? now - (deltaMs % interval) : now
      fn(deltaMs)
    }
    this.id = globalThis.requestAnimationFrame(tick)
  }

  isActive() {
    return this.id !== null
  }

  cancel = () => {
    if (this.id === null) return
    globalThis.cancelAnimationFrame(this.id)
    this.id = null
  }
}
