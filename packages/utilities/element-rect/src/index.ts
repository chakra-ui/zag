type Fn = (rect: Rect) => void

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

interface ObservedData {
  rect: Rect
  callbacks: Fn[]
}

let rafId: number

const observedElements = new Map<HTMLElement, ObservedData>()

type TrackScope = "size" | "position" | "rect"

export type ElementRectOptions = {
  onChange: (rect: Rect) => void
  scope?: TrackScope
  getRect?: (el: HTMLElement) => Rect
}

const getRectFn = (el: HTMLElement) => el.getBoundingClientRect()

export function trackElementRect(el: HTMLElement, options: ElementRectOptions) {
  const { scope = "rect", getRect = getRectFn, onChange } = options
  const loop = getLoopFn({ scope, getRect })

  const data = observedElements.get(el)

  if (!data) {
    observedElements.set(el, {
      rect: {} as Rect,
      callbacks: [onChange],
    })

    if (observedElements.size === 1) {
      rafId = requestAnimationFrame(loop)
    }
  } else {
    data.callbacks.push(onChange)
    onChange(getRect(el))
  }

  return function unobserve() {
    const data = observedElements.get(el)
    if (!data) return

    const index = data.callbacks.indexOf(onChange)
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

function getLoopFn(options: Required<Omit<ElementRectOptions, "onChange">>) {
  const { scope, getRect } = options
  const isEqual = getEqualityFn(scope)
  return function loop() {
    const changedRectsData: Array<ObservedData> = []

    observedElements.forEach((data, element) => {
      const newRect = getRect(element)

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

const isEqualSize = (a: Rect, b: Rect) => a.width === b.width && a.height === b.height

const isEqualPosition = (a: Rect, b: Rect) => a.top === b.top && a.left === b.left

const isEqualRect = (a: Rect, b: Rect) => isEqualSize(a, b) && isEqualPosition(a, b)

function getEqualityFn(scope: TrackScope) {
  if (scope === "size") return isEqualSize
  if (scope === "position") return isEqualPosition
  return isEqualRect
}
