type AnimationFrameGlobal = {
  requestAnimationFrame: ((callback: VoidFunction) => number) | undefined
  cancelAnimationFrame: ((handle: number) => void) | undefined
}

export function installAnimationFrameMock() {
  const rafQueue: VoidFunction[] = []
  const cancelled = new Set<number>()
  const animationFrameGlobal = globalThis as unknown as AnimationFrameGlobal
  const originalRaf = animationFrameGlobal.requestAnimationFrame
  const originalCancel = animationFrameGlobal.cancelAnimationFrame
  let nextId = 1

  animationFrameGlobal.requestAnimationFrame = (callback: VoidFunction) => {
    const id = nextId++
    rafQueue.push(() => {
      if (!cancelled.has(id)) callback()
    })
    return id
  }
  animationFrameGlobal.cancelAnimationFrame = (id: number) => {
    cancelled.add(id)
  }

  const flushNextRaf = () => {
    const callback = rafQueue.shift()
    if (!callback) throw new Error("Expected a queued requestAnimationFrame callback")
    callback()
  }

  return {
    rafQueue,
    cancelled,
    flushNextRaf,
    restore: () => {
      animationFrameGlobal.requestAnimationFrame = originalRaf
      animationFrameGlobal.cancelAnimationFrame = originalCancel
    },
  }
}

export type AnimationFrameMock = ReturnType<typeof installAnimationFrameMock>

type MockScrollContainerOptions = {
  viewport?: { width: number; height: number }
  scrollTop?: number
  scrollLeft?: number
  firstScrollToTop?: number
  omitScrollTo?: boolean
}

export function createMockScrollContainer(options: MockScrollContainerOptions = {}) {
  const {
    viewport = { width: 100, height: 200 },
    scrollTop: initialScrollTop = 0,
    scrollLeft: initialScrollLeft = 0,
    firstScrollToTop,
    omitScrollTo = false,
  } = options

  let scrollTop = initialScrollTop
  let scrollLeft = initialScrollLeft
  let scrollToCount = 0

  const element = {
    get scrollTop() {
      return scrollTop
    },
    set scrollTop(value: number) {
      scrollTop = value
    },
    get scrollLeft() {
      return scrollLeft
    },
    set scrollLeft(value: number) {
      scrollLeft = value
    },
    getBoundingClientRect: () => ({ width: viewport.width, height: viewport.height }),
  } as unknown as HTMLElement

  if (!omitScrollTo) {
    Object.assign(element, {
      scrollTo: ({ top = scrollTop, left = scrollLeft }: ScrollToOptions) => {
        scrollToCount++
        scrollTop = scrollToCount === 1 && firstScrollToTop != null ? firstScrollToTop : top
        scrollLeft = left
      },
    })
  }

  return {
    element,
    getScrollToCount: () => scrollToCount,
    getScrollTop: () => scrollTop,
    getScrollLeft: () => scrollLeft,
  }
}

export function createMeasuredElement(height: number, width = height): HTMLElement {
  return { offsetHeight: height, offsetWidth: width } as HTMLElement
}

export function createResizeObserverEntry(
  target: Element,
  blockSize: number,
  inlineSize = blockSize,
): ResizeObserverEntry {
  return {
    target,
    borderBoxSize: [{ inlineSize, blockSize }],
    contentRect: { width: inlineSize, height: blockSize },
  } as unknown as ResizeObserverEntry
}
