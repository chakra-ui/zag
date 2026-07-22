// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest"
import { proxyTabFocus } from "../src"

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

function pressTab(shiftKey = false) {
  document.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
      shiftKey,
    }),
  )
}

describe("proxyTabFocus", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("does not loop into portalled content when the trigger is the last page tabbable", () => {
    const trigger = createButton("Trigger")
    const content = markVisible(document.createElement("div"))
    const first = createButton("First")
    const last = createButton("Last")
    content.append(first, last)
    // Portalled: content is after the trigger at the end of the body
    document.body.append(trigger, content)

    const onFocus = vi.fn((el: HTMLElement) => el.focus())
    const cleanup = proxyTabFocus(content, { triggerElement: trigger, onFocus })

    last.focus()
    pressTab()

    expect(onFocus).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(last)

    cleanup()
  })

  it("tabs from the last content item to the next tabbable after the trigger", () => {
    const trigger = createButton("Trigger")
    const after = createButton("After")
    const content = markVisible(document.createElement("div"))
    const first = createButton("First")
    const last = createButton("Last")
    content.append(first, last)
    document.body.append(trigger, after, content)

    const onFocus = vi.fn((el: HTMLElement) => el.focus())
    const cleanup = proxyTabFocus(content, { triggerElement: trigger, onFocus })

    last.focus()
    pressTab()

    expect(onFocus).toHaveBeenCalledWith(after)
    expect(document.activeElement).toBe(after)

    cleanup()
  })

  it("shift+tabs from the next after trigger into the last content item", () => {
    const trigger = createButton("Trigger")
    const after = createButton("After")
    const content = markVisible(document.createElement("div"))
    const first = createButton("First")
    const last = createButton("Last")
    content.append(first, last)
    document.body.append(trigger, after, content)

    const onFocus = vi.fn((el: HTMLElement) => el.focus())
    const cleanup = proxyTabFocus(content, { triggerElement: trigger, onFocus })

    after.focus()
    pressTab(true)

    expect(onFocus).toHaveBeenCalledWith(last)
    expect(document.activeElement).toBe(last)

    cleanup()
  })

  it("tabs from the trigger into the first content item", () => {
    const trigger = createButton("Trigger")
    const content = markVisible(document.createElement("div"))
    const first = createButton("First")
    const last = createButton("Last")
    content.append(first, last)
    document.body.append(trigger, content)

    const onFocus = vi.fn((el: HTMLElement) => el.focus())
    const cleanup = proxyTabFocus(content, { triggerElement: trigger, onFocus })

    trigger.focus()
    pressTab()

    expect(onFocus).toHaveBeenCalledWith(first)
    expect(document.activeElement).toBe(first)

    cleanup()
  })

  it("resolves container and trigger getters on keydown", () => {
    const trigger = createButton("Trigger")
    const after = createButton("After")
    document.body.append(trigger, after)

    let content: HTMLElement | null = null
    const onFocus = vi.fn((el: HTMLElement) => el.focus())
    const cleanup = proxyTabFocus(() => content, {
      triggerElement: () => trigger,
      onFocus,
    })

    content = markVisible(document.createElement("div"))
    const first = createButton("First")
    const last = createButton("Last")
    content.append(first, last)
    document.body.append(content)

    last.focus()
    pressTab()

    expect(onFocus).toHaveBeenCalledWith(after)
    expect(document.activeElement).toBe(after)

    cleanup()
  })
})
