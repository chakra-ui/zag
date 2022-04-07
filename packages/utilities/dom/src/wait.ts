export function waitFor<T>(predicate: () => T): Promise<T> {
  let value = predicate()
  if (!!value) return Promise.resolve(value)
  return new Promise((resolve) => {
    const id = globalThis.setInterval(function () {
      let value = predicate()
      if (value) {
        globalThis.clearInterval(id)
        resolve(value)
      }
    }, 0)
  })
}

export function waitForEvent(el: HTMLElement, eventName: string) {
  return new Promise<void>((resolve) => {
    function done(event: Event) {
      if (event.target === el) {
        el.removeEventListener(eventName, done)
        resolve()
      }
    }

    el.addEventListener(eventName, done)
  })
}
