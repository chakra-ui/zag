import { afterEach, describe, expect, test, vi } from "vitest"
import { WindowVirtualizer } from "../src/window-virtualizer"

type MockWindow = {
  addEventListener: ReturnType<typeof vi.fn>
  removeEventListener: ReturnType<typeof vi.fn>
  scrollTo: ReturnType<typeof vi.fn>
  innerWidth: number
  innerHeight: number
  pageXOffset: number
  pageYOffset: number
}

function createMockWindow(): MockWindow {
  return {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    scrollTo: vi.fn(),
    innerWidth: 1024,
    innerHeight: 768,
    pageXOffset: 0,
    pageYOffset: 0,
  }
}

function createRootElement(top = 0): HTMLElement {
  return {
    parentElement: null,
    getBoundingClientRect: () => ({ top, left: 0, width: 320, height: 200 }),
    scrollTop: 0,
    scrollLeft: 0,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    scrollTo: vi.fn(),
  } as unknown as HTMLElement
}

describe("WindowVirtualizer", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("constructs safely when window is unavailable", () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, "window")
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      writable: true,
      value: undefined,
    })

    try {
      expect(
        () =>
          new WindowVirtualizer({
            count: 10,
            estimatedSize: () => 10,
            initialRect: { width: 320, height: 120 },
          }),
      ).not.toThrow()
    } finally {
      if (descriptor) {
        Object.defineProperty(globalThis, "window", descriptor)
      } else {
        delete (globalThis as { window?: unknown }).window
      }
    }
  })

  test("returns virtual items before init when initialRect is provided", () => {
    const virtualizer = new WindowVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      overscan: 0,
      initialRect: { width: 320, height: 30 },
    })

    expect(virtualizer.getVirtualItems().map((item) => item.index)).toEqual([0, 1, 2])
  })

  test("applies initialMeasurements seeds before init", () => {
    const virtualizer = new WindowVirtualizer({
      count: 5,
      estimatedSize: () => 10,
      overscan: 0,
      initialRect: { width: 320, height: 25 },
      initialMeasurements: { 0: 40, 1: 30 },
    })

    expect(virtualizer.getTotalSize()).toBe(100)
    expect(virtualizer.getVisibleRange()).toEqual({ startIndex: 0, endIndex: 0 })
    expect(virtualizer.getVirtualItems().map((item) => item.index)).toEqual([0])
  })

  test("destroy prevents queued init microtask scroll notification", async () => {
    const mockWindow = createMockWindow()
    const onScroll = vi.fn()
    const rootElement = createRootElement(-60)
    const virtualizer = new WindowVirtualizer({
      count: 100,
      estimatedSize: () => 20,
      initialRect: { width: 320, height: 200 },
      scrollingElement: rootElement,
      getWindow: () => mockWindow as unknown as Window & typeof globalThis,
      onScroll,
    })

    virtualizer.init(rootElement)
    virtualizer.destroy()

    await Promise.resolve()

    expect(onScroll).not.toHaveBeenCalled()
  })

  test("destroy tears down window listeners", () => {
    const mockWindow = createMockWindow()
    const rootElement = createRootElement()
    const virtualizer = new WindowVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      initialRect: { width: 320, height: 120 },
      scrollingElement: rootElement,
      getWindow: () => mockWindow as unknown as Window & typeof globalThis,
    })

    virtualizer.init(rootElement)
    virtualizer.destroy()

    expect(mockWindow.addEventListener).toHaveBeenCalledWith("resize", expect.any(Function), { passive: true })
    expect(mockWindow.removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function))
    expect(rootElement.addEventListener).toHaveBeenCalledWith("scroll", expect.any(Function), { passive: true })
    expect(rootElement.removeEventListener).toHaveBeenCalledWith("scroll", expect.any(Function))
  })
})
