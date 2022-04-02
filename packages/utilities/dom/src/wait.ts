export function waitUntil(predicate: () => boolean) {
  if (predicate()) return Promise.resolve(true)
  return new Promise((resolve) => {
    const id = globalThis.setInterval(function () {
      if (predicate()) {
        globalThis.clearInterval(id)
        resolve(true)
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
