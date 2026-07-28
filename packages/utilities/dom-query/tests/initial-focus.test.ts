// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest"
import { getInitialFocus } from "../src"

function markVisible<T extends HTMLElement>(element: T): T {
  Object.defineProperty(element, "offsetWidth", { configurable: true, get: () => 1 })
  Object.defineProperty(element, "offsetHeight", { configurable: true, get: () => 1 })
  Object.defineProperty(element, "getClientRects", {
    configurable: true,
    value: () => [{ width: 1, height: 1 }],
  })
  return element
}

function createButton(text: string) {
  const button = markVisible(document.createElement("button"))
  button.type = "button"
  button.textContent = text
  return button
}

function createRoot() {
  const root = markVisible(document.createElement("div"))
  root.tabIndex = -1
  document.body.append(root)
  return root
}

describe("getInitialFocus", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("returns undefined when disabled", () => {
    const root = createRoot()
    root.append(createButton("One"))

    expect(getInitialFocus({ root, enabled: false })).toBeUndefined()
  })

  it("prefers getInitialEl when provided", () => {
    const root = createRoot()
    const first = createButton("First")
    const second = createButton("Second")
    root.append(first, second)

    expect(getInitialFocus({ root, getInitialEl: () => second })).toBe(second)
  })

  it("prefers data-autofocus over first tabbable", () => {
    const root = createRoot()
    const first = createButton("First")
    const second = createButton("Second")
    second.setAttribute("data-autofocus", "")
    root.append(first, second)

    expect(getInitialFocus({ root })).toBe(second)
  })

  it("skips elements with data-no-autofocus", () => {
    const root = createRoot()
    const close = createButton("Close")
    close.setAttribute("data-no-autofocus", "")
    const help = createButton("Help")
    help.setAttribute("data-no-autofocus", "")
    const submit = createButton("Submit")
    root.append(close, help, submit)

    expect(getInitialFocus({ root })).toBe(submit)
  })

  it("lets data-autofocus win over data-no-autofocus", () => {
    const root = createRoot()
    const close = createButton("Close")
    close.setAttribute("data-no-autofocus", "")
    close.setAttribute("data-autofocus", "")
    const submit = createButton("Submit")
    root.append(close, submit)

    expect(getInitialFocus({ root })).toBe(close)
  })

  it("falls back to root when every tabbable has data-no-autofocus", () => {
    const root = createRoot()
    const close = createButton("Close")
    close.setAttribute("data-no-autofocus", "")
    const help = createButton("Help")
    help.setAttribute("data-no-autofocus", "")
    root.append(close, help)

    expect(getInitialFocus({ root })).toBe(root)
  })

  it("falls back to root when there are no tabbables", () => {
    const root = createRoot()
    expect(getInitialFocus({ root })).toBe(root)
  })

  it("respects the filter option", () => {
    const root = createRoot()
    const menuitem = createButton("Item")
    menuitem.setAttribute("role", "menuitem")
    const other = createButton("Other")
    root.append(menuitem, other)

    expect(
      getInitialFocus({
        root,
        filter: (el) => !el.role?.startsWith("menuitem"),
      }),
    ).toBe(other)
  })
})
