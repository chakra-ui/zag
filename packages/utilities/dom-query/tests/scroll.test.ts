// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest"
import { scrollToNearest } from "../src"

interface Box {
  top: number
  height: number
  scrollHeight?: number
}

// jsdom has no layout, so give each element a fixed box and scroll size
function layout<T extends HTMLElement>(element: T, { top, height, scrollHeight = height }: Box): T {
  const define = (key: string, get: () => number) => Object.defineProperty(element, key, { configurable: true, get })
  define("clientHeight", () => height)
  define("offsetHeight", () => height)
  define("scrollHeight", () => scrollHeight)
  define("clientWidth", () => 100)
  define("offsetWidth", () => 100)
  define("scrollWidth", () => 100)
  element.getBoundingClientRect = () =>
    ({
      top,
      bottom: top + height,
      left: 0,
      right: 100,
      width: 100,
      height,
      x: 0,
      y: top,
    }) as DOMRect
  element.scrollTo = vi.fn() as typeof element.scrollTo
  return element
}

function setup() {
  // content -> scroll area viewport -> item, as when the content wraps a custom scroll area
  const content = layout(document.createElement("div"), {
    top: 0,
    height: 100,
  })
  content.style.overflow = "hidden"
  const viewport = layout(document.createElement("div"), {
    top: 0,
    height: 100,
    scrollHeight: 400,
  })
  viewport.style.overflowY = "auto"
  const item = layout(document.createElement("div"), { top: 250, height: 20 })
  viewport.append(item)
  content.append(viewport)
  document.body.append(content)
  return { content, viewport, item }
}

describe("scrollToNearest", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("scrolls the root when it is scrollable", () => {
    const { content, viewport, item } = setup()
    layout(content, { top: 0, height: 100, scrollHeight: 400 })
    content.style.overflowY = "auto"
    viewport.style.overflowY = "visible"

    expect(scrollToNearest(item, { rootEl: content })).toBe(true)
    expect(content.scrollTo).toHaveBeenCalledWith({ top: 170, left: 0 })
    expect(viewport.scrollTo).not.toHaveBeenCalled()
  })

  it("scrolls a scrollable ancestor of the item inside the root when the root does not scroll", () => {
    const { content, viewport, item } = setup()

    expect(scrollToNearest(item, { rootEl: content })).toBe(true)
    expect(viewport.scrollTo).toHaveBeenCalledWith({ top: 170, left: 0 })
    expect(content.scrollTo).not.toHaveBeenCalled()
  })

  it("does not scroll a scrollable ancestor outside the root", () => {
    const outer = layout(document.createElement("div"), {
      top: 0,
      height: 100,
      scrollHeight: 400,
    })
    outer.style.overflowY = "auto"
    const content = layout(document.createElement("div"), {
      top: 0,
      height: 300,
    })
    const item = layout(document.createElement("div"), {
      top: 250,
      height: 20,
    })
    content.append(item)
    outer.append(content)
    document.body.append(outer)

    scrollToNearest(item, { rootEl: content })
    expect(outer.scrollTo).not.toHaveBeenCalled()
  })
})
