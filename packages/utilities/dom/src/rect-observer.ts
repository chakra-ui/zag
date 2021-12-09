// Credit goes to the radix-ui team for this utility:
// https://github.com/radix-ui/primitives/blob/main/packages/core/rect/src/observeElementRect.ts

export type Measurable = { getBoundingClientRect(): DOMRect }

export function observeElementRect(el: Measurable, fn: CallbackFn) {
  const data = observedElements.get(el)

  if (!data) {
    observedElements.set(el, { rect: {} as DOMRect, callbacks: [fn] })

    if (observedElements.size === 1) {
      rafId = requestAnimationFrame(runLoop)
    }
  } else {
    data.callbacks.push(fn)
    fn(el.getBoundingClientRect())
  }

  return () => {
    const data = observedElements.get(el)
    if (!data) return

    const index = data.callbacks.indexOf(fn)
    if (index > -1) {
      data.callbacks.splice(index, 1)
    }

    if (data.callbacks.length === 0) {
      observedElements.delete(el)

      if (observedElements.size === 0) {
        cancelAnimationFrame(rafId)
      }
    }
  }
}

type CallbackFn = (rect: DOMRect) => void

type ObservedData = {
  rect: DOMRect
  callbacks: Array<CallbackFn>
}

let rafId: number
const observedElements: Map<Measurable, ObservedData> = new Map()

function runLoop() {
  const changedRectsData: Array<ObservedData> = []

  observedElements.forEach((data, element) => {
    const newRect = element.getBoundingClientRect()

    if (!isEqual(data.rect, newRect)) {
      data.rect = newRect
      changedRectsData.push(data)
    }
  })

  changedRectsData.forEach((data) => {
    data.callbacks.forEach((callback) => callback(data.rect))
  })

  rafId = requestAnimationFrame(runLoop)
}

function isEqual(rect1: DOMRect, rect2: DOMRect) {
  return (
    rect1.width === rect2.width &&
    rect1.height === rect2.height &&
    rect1.top === rect2.top &&
    rect1.right === rect2.right &&
    rect1.bottom === rect2.bottom &&
    rect1.left === rect2.left
  )
}
