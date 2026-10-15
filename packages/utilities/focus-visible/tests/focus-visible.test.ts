// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
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
    document.body.replaceChildren()
  })

  // The shape of Storybook's instrumented `focus`: the getter reads `this.ownerDocument`, which
  // throws off the prototype but resolves the native method for an element.
  const instrumentFocus = () => {
    const native = HTMLElement.prototype.focus
    const accessor = {
      configurable: true,
      get(this: HTMLElement) {
        return this.ownerDocument?.defaultView ? native : () => {}
      },
      set() {},
    }
    Object.defineProperty(HTMLElement.prototype, "focus", accessor)
    return accessor
  }

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
      const focus = HTMLElement.prototype.focus
      HTMLElement.prototype.focus = focus
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

  it("should mark programmatic focus as such when focus is an accessor it cannot read", async () => {
    // A fresh module: earlier tests leave `hasEventBeforeFocus` set by their keydown.
    vi.resetModules()
    const { getInteractionModality, isFocusVisible, setInteractionModality, trackFocusVisible } = await import("../src")
    instrumentFocus()
    trackFocusVisible()

    // A pointer opened the dialog, which then moves focus itself.
    setInteractionModality("pointer")
    const button = document.body.appendChild(document.createElement("button"))
    button.focus()

    expect(document.activeElement).toBe(button)
    expect(getInteractionModality()).toBe("pointer")
    expect(isFocusVisible()).toBe(false)

    // Tear this module's tracking down so its teardown cannot fire in a later test.
    window.dispatchEvent(new Event("beforeunload"))
  })

  it("should restore an accessor focus it could not read on teardown", () => {
    const accessor = instrumentFocus()
    trackFocusVisible()

    window.dispatchEvent(new Event("beforeunload"))

    expect(Object.getOwnPropertyDescriptor(HTMLElement.prototype, "focus")?.get).toBe(accessor.get)
  })
})
