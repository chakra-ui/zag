const EMPTY: number = 0

export class Timeout {
  currentId: any = EMPTY
  start(delay: number, fn: Function) {
    this.clear()
    this.currentId = setTimeout(() => {
      this.currentId = EMPTY
      fn()
    }, delay) as unknown as number
  }
  isStarted() {
    return this.currentId !== EMPTY
  }
  clear = () => {
    if (this.currentId !== EMPTY) {
      clearTimeout(this.currentId)
      this.currentId = EMPTY
    }
  }
  disposeEffect = () => {
    return this.clear
  }
}
