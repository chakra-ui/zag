// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { isFocusVisible, listenerMap, trackFocusVisible } from "../src"

describe("focus visible", () => {
  let descriptor: PropertyDescriptor

  // The teardown `trackFocusVisible` returns only drops the change handler, so the
  // patched prototype and the listener map outlive each test.
  beforeEach(() => {
    descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "focus")!
    listenerMap.delete(window)
  })

  afterEach(() => {
    Object.defineProperty(HTMLElement.prototype, "focus", descriptor)
    listenerMap.delete(window)
  })

  it("should set up when the prototype's focus cannot be read", () => {
    // Storybook's instrumenter replaces `focus` with an accessor that dereferences `this`,
    // so reading it off the prototype throws.
    Object.defineProperty(HTMLElement.prototype, "focus", {
      configurable: true,
      get(this: HTMLElement) {
        return this.ownerDocument.defaultView!.HTMLElement.prototype.focus
      },
    })

    expect(() => trackFocusVisible()).not.toThrow()

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }))
    expect(isFocusVisible()).toBe(true)
  })

  it("should keep the prototype's own focus for teardown", () => {
    const original = HTMLElement.prototype.focus

    trackFocusVisible()

    // A bare `focus` reference resolves to the global `window.focus`, which teardown
    // would then install on every element.
    expect(listenerMap.get(window)?.focus).toBe(original)
    expect(listenerMap.get(window)?.focus).not.toBe(window.focus)
  })

  it("should record no focus to restore when the prototype's focus cannot be read", () => {
    Object.defineProperty(HTMLElement.prototype, "focus", {
      configurable: true,
      get() {
        throw new Error("unreadable")
      },
    })

    trackFocusVisible()

    expect(listenerMap.get(window)?.focus).toBeUndefined()
  })
})
