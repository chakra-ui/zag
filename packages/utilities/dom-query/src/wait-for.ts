import { isHTMLElement } from "./is"

type ElementGetter = () => Element | null

const fps = 1000 / 60

export function waitForElement(query: ElementGetter, cb: (el: HTMLElement) => void) {
  const el = query()

  if (isHTMLElement(el) && el.isConnected) {
    cb(el)
    return () => void 0
  } else {
    const timerId = setInterval(() => {
      const el = query()
      if (isHTMLElement(el) && el.isConnected) {
        cb(el)
        clearInterval(timerId)
      }
    }, fps)

    return () => clearInterval(timerId)
  }
}

export function waitForElements(queries: ElementGetter[], cb: (el: HTMLElement) => void) {
  const cleanups: VoidFunction[] = []

  queries?.forEach((query) => {
    const clean = waitForElement(query, cb)
    cleanups.push(clean)
  })

  return () => {
    cleanups.forEach((fn) => fn())
  }
}
