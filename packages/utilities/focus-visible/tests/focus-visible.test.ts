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

  it("should keep the prototype's focus writable when it was an accessor", () => {
    // Storybook's preview defines `focus` as an accessor with a setter. Redefining it as a
    // data property without `writable` makes it read-only, so later assignments throw.
    let current = HTMLElement.prototype.focus
    Object.defineProperty(HTMLElement.prototype, "focus", {
      configurable: true,
      get: () => current,
      set: (next) => {
        current = next
      },
    })

    trackFocusVisible()

    const assignFocus = () => {
      HTMLElement.prototype.focus = HTMLElement.prototype.focus
    }
    expect(Object.getOwnPropertyDescriptor(HTMLElement.prototype, "focus")?.writable).toBe(true)
    expect(assignFocus).not.toThrow()

    window.dispatchEvent(new Event("beforeunload"))

    expect(Object.getOwnPropertyDescriptor(HTMLElement.prototype, "focus")?.writable).toBe(true)
    expect(assignFocus).not.toThrow()
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
