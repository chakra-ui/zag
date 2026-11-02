const EMPTY = 0

export class Timeout {
  static create() {
    return new Timeout()
  }

  private id: ReturnType<typeof setTimeout> | typeof EMPTY = EMPTY

  /** Runs `fn` after `delay`, clearing any pending call */
  start(delay: number, fn: VoidFunction) {
    this.clear()
    this.id = setTimeout(() => {
      this.id = EMPTY
      fn()
    }, delay)
  }

  isStarted() {
    return this.id !== EMPTY
  }

  clear = () => {
    if (this.id === EMPTY) return
    clearTimeout(this.id)
    this.id = EMPTY
  }
}
