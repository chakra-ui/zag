export interface AutoReset<T> {
  get(): T
  set(v: T): void
  cleanup(): void
}

export function autoReset<T>(init: T, timeout: number): AutoReset<T> {
  let timer: any = null
  let value: T = init

  const resetAfter = () =>
    setTimeout(() => {
      value = init
    }, timeout)

  return {
    get() {
      return value
    },
    set(v: T) {
      value = v
      if (timer) clearTimeout(timer)
      timer = resetAfter()
    },
    cleanup() {
      if (timer) clearTimeout(timer)
      timer = null
    },
  }
}
