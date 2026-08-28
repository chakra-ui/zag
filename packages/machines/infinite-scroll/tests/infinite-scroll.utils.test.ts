// @vitest-environment jsdom

import { afterEach, describe, expect, test } from "vitest"
import { getRootMargin, isScrollableElement, resolveScroller, toMarginValue } from "../src/infinite-scroll.utils"

describe("toMarginValue", () => {
  test("converts a number to a viewport percentage", () => {
    expect(toMarginValue(1)).toBe("100%")
    expect(toMarginValue(0.5)).toBe("50%")
    expect(toMarginValue(0)).toBe("0%")
  })

  test("passes a css length through untouched", () => {
    expect(toMarginValue("200px")).toBe("200px")
    expect(toMarginValue("10rem")).toBe("10rem")
  })
})

describe("getRootMargin", () => {
  const margin = (overrides: Partial<Parameters<typeof getRootMargin>[0]>) =>
    getRootMargin({ offset: 1, orientation: "vertical", edge: "end", dir: "ltr", ...overrides })

  test("vertical expands only the leading edge", () => {
    expect(margin({ orientation: "vertical", edge: "end" })).toBe("0px 0px 100% 0px")
    expect(margin({ orientation: "vertical", edge: "start" })).toBe("100% 0px 0px 0px")
  })

  test("vertical ignores dir", () => {
    expect(margin({ orientation: "vertical", edge: "end", dir: "rtl" })).toBe("0px 0px 100% 0px")
    expect(margin({ orientation: "vertical", edge: "start", dir: "rtl" })).toBe("100% 0px 0px 0px")
  })

  test("horizontal ltr expands right for end, left for start", () => {
    expect(margin({ orientation: "horizontal", edge: "end", dir: "ltr" })).toBe("0px 100% 0px 0px")
    expect(margin({ orientation: "horizontal", edge: "start", dir: "ltr" })).toBe("0px 0px 0px 100%")
  })

  test("horizontal rtl mirrors ltr", () => {
    expect(margin({ orientation: "horizontal", edge: "end", dir: "rtl" })).toBe("0px 0px 0px 100%")
    expect(margin({ orientation: "horizontal", edge: "start", dir: "rtl" })).toBe("0px 100% 0px 0px")
  })

  test("never expands the cross axis", () => {
    // a horizontal scroller expanded on the block axis reports false positives
    for (const edge of ["start", "end"] as const) {
      for (const dir of ["ltr", "rtl"] as const) {
        const [top, , bottom] = margin({ orientation: "horizontal", edge, dir }).split(" ")
        expect([top, bottom]).toEqual(["0px", "0px"])
      }
    }
  })

  test("accepts a css length offset", () => {
    expect(margin({ offset: "250px" })).toBe("0px 0px 250px 0px")
  })
})

/* -----------------------------------------------------------------------------
 * DOM helpers
 * -----------------------------------------------------------------------------*/

const created: HTMLElement[] = []

function div(style = "") {
  const el = document.createElement("div")
  el.setAttribute("style", style)
  return el
}

function mount(el: HTMLElement) {
  document.body.appendChild(el)
  created.push(el)
  return el
}

afterEach(() => {
  created.forEach((el) => el.remove())
  created.length = 0
})

describe("isScrollableElement", () => {
  test("is true for scrollable overflow values", () => {
    for (const value of ["auto", "scroll", "overlay"]) {
      expect(isScrollableElement(mount(div(`overflow: ${value}`)))).toBe(true)
    }
  })

  test("is true on a single axis", () => {
    expect(isScrollableElement(mount(div("overflow-y: auto")))).toBe(true)
    expect(isScrollableElement(mount(div("overflow-x: scroll")))).toBe(true)
  })

  test("is false for non-scrolling overflow values", () => {
    for (const value of ["visible", "hidden", "clip"]) {
      expect(isScrollableElement(mount(div(`overflow: ${value}`)))).toBe(false)
    }
  })

  test("is false when the box cannot scroll regardless of overflow", () => {
    expect(isScrollableElement(mount(div("overflow: auto; display: inline")))).toBe(false)
    expect(isScrollableElement(mount(div("overflow: auto; display: contents")))).toBe(false)
  })

  test("does not require the element to be overflowing yet", () => {
    // the observer root is captured once, before the list is long enough to scroll
    const el = mount(div("overflow: auto; height: 100px"))
    expect(el.scrollHeight).toBe(el.clientHeight)
    expect(isScrollableElement(el)).toBe(true)
  })
})

describe("resolveScroller", () => {
  test("returns null for a null element", () => {
    expect(resolveScroller(null)).toBeNull()
  })

  test("returns null when the page itself is the scroller", () => {
    // IntersectionObserver treats null as the page viewport; document.body is not equivalent
    const sentinel = div()
    mount(div()).appendChild(sentinel)
    expect(resolveScroller(sentinel)).toBeNull()
  })

  test("finds the nearest scrolling ancestor", () => {
    const scroller = mount(div("overflow-y: auto"))
    const inner = div()
    const sentinel = div()
    scroller.appendChild(inner)
    inner.appendChild(sentinel)
    expect(resolveScroller(sentinel)).toBe(scroller)
  })

  test("skips wrappers that clip but never scroll", () => {
    const scroller = mount(div("overflow-y: auto"))
    const clipped = div("overflow: hidden")
    const sentinel = div()
    scroller.appendChild(clipped)
    clipped.appendChild(sentinel)
    expect(resolveScroller(sentinel)).toBe(scroller)
  })

  test("returns the innermost scroller when several are nested", () => {
    const outer = mount(div("overflow-y: auto"))
    const inner = div("overflow-y: scroll")
    const sentinel = div()
    outer.appendChild(inner)
    inner.appendChild(sentinel)
    expect(resolveScroller(sentinel)).toBe(inner)
  })

  test("crosses a shadow boundary to reach a scroller in the light DOM", () => {
    const scroller = mount(div("overflow-y: auto"))
    const host = div()
    scroller.appendChild(host)
    const sentinel = div()
    host.attachShadow({ mode: "open" }).appendChild(sentinel)
    // `parentElement` stops dead at the shadow root, so this only passes via getParentNode
    expect(sentinel.parentElement).toBeNull()
    expect(resolveScroller(sentinel)).toBe(scroller)
  })
})
