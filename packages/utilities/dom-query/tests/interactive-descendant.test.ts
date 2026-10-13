// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest"
import { isInteractiveDescendant } from "../src"

// jsdom has no layout; tabbable checks need the element to look visible
function markVisible<T extends HTMLElement>(element: T): T {
  Object.defineProperty(element, "offsetWidth", { configurable: true, get: () => 1 })
  Object.defineProperty(element, "getClientRects", { configurable: true, value: () => [{ width: 1, height: 1 }] })
  return element
}

function createRow() {
  const row = markVisible(document.createElement("div"))
  row.tabIndex = 0
  document.body.append(row)
  return row
}

afterEach(() => {
  document.body.innerHTML = ""
})

describe("isInteractiveDescendant", () => {
  it("is true for a nested button and for an icon inside it", () => {
    const row = createRow()
    const button = markVisible(document.createElement("button"))
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    button.append(icon)
    row.append(button)

    expect(isInteractiveDescendant(row, button)).toBe(true)
    expect(isInteractiveDescendant(row, icon)).toBe(true)
  })

  it("is false for the container itself and for plain content", () => {
    const row = createRow()
    const text = document.createElement("span")
    row.append(text)

    expect(isInteractiveDescendant(row, row)).toBe(false)
    expect(isInteractiveDescendant(row, text)).toBe(false)
  })

  it("ignores elements that are not tabbable", () => {
    const row = createRow()
    const button = markVisible(document.createElement("button"))
    button.tabIndex = -1
    row.append(button)

    expect(isInteractiveDescendant(row, button)).toBe(false)
  })

  it("is false for targets outside the container", () => {
    const row = createRow()
    const outside = markVisible(document.createElement("button"))
    document.body.append(outside)

    expect(isInteractiveDescendant(row, outside)).toBe(false)
  })

  it("crosses shadow roots", () => {
    const row = createRow()
    const host = document.createElement("div")
    row.append(host)
    const button = markVisible(document.createElement("button"))
    host.attachShadow({ mode: "open" }).append(button)

    expect(isInteractiveDescendant(row, button)).toBe(true)
  })

  it("works when the container itself lives in a shadow root", () => {
    const host = document.createElement("div")
    document.body.append(host)
    const shadow = host.attachShadow({ mode: "open" })
    const row = markVisible(document.createElement("div"))
    const button = markVisible(document.createElement("button"))
    row.append(button)
    shadow.append(row)

    expect(isInteractiveDescendant(row, button)).toBe(true)
  })
})
