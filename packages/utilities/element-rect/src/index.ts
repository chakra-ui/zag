type Fn = (rect: DOMRect) => void

type ObservedData = {
  rect: DOMRect
  callbacks: Fn[]
}

export type Measurable = {
  getBoundingClientRect(): DOMRect
}

let rafId: number

const observedElements = new Map<Measurable, ObservedData>()

type TrackScope = "size" | "position" | "rect"

type TrackRectOptions = {
  scope?: TrackScope
}

export function trackElementRect(el: Measurable, fn: Fn, options: TrackRectOptions = {}) {
  const { scope = "rect" } = options
  const loop = getLoopFn(scope)

  const data = observedElements.get(el)

  if (!data) {
    observedElements.set(el, {
      rect: {} as DOMRect,
      callbacks: [fn],
    })

    if (observedElements.size === 1) {
      rafId = requestAnimationFrame(loop)
    }
  } else {
    data.callbacks.push(fn)
    fn(el.getBoundingClientRect())
  }

  return function unobserve() {
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

function getLoopFn(scope: TrackScope) {
  const isEqual = getEqualityFn(scope)
  return function loop() {
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

    rafId = requestAnimationFrame(loop)
  }
}

const isEqualSize = (a: DOMRect, b: DOMRect) => a.width === b.width && a.height === b.height

const isEqualPosition = (a: DOMRect, b: DOMRect) =>
  a.top === b.top && a.right === b.right && a.bottom === b.bottom && a.left === b.left

const isEqualRect = (a: DOMRect, b: DOMRect) => isEqualSize(a, b) && isEqualPosition(a, b)

function getEqualityFn(scope: TrackScope) {
  if (scope === "size") return isEqualSize
  if (scope === "position") return isEqualPosition
  return isEqualRect
}
