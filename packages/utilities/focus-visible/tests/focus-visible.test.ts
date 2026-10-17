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
    window.dispatchEvent(new Event("beforeunload"))
    Object.defineProperty(HTMLElement.prototype, "focus", descriptor)
    listenerMap.delete(window)
    document.body.replaceChildren()
  })

  // Storybook 10.0–10.5's `enhanceContext` loader. The getter reads `this.ownerDocument`, which
  // throws off the prototype.
  const installStorybookFocus = () => {
    const originalFocus = HTMLElement.prototype.focus
    let currentFocus = originalFocus
    const noopFocus = () => {}
    const focusingElements = new Set<HTMLElement>()
    const accessor: PropertyDescriptor = {
      configurable: true,
      set: (newFocus) => {
        currentFocus = newFocus
      },
      get(this: HTMLElement) {
        if (!this.ownerDocument?.defaultView) return noopFocus
        if (focusingElements.has(this)) return originalFocus
        focusingElements.add(this)
        setTimeout(() => focusingElements.delete(this), 0)
        return currentFocus
      },
    }
    Object.defineProperty(HTMLElement.prototype, "focus", accessor)
    return accessor
  }

  // Module state (e.g. a pending keydown) leaks between tests, so interaction tests load a fresh copy
  const loadFresh = async () => {
    vi.resetModules()
    return import("../src")
  }

  const pointerdown = (el: Element) => {
    const type = typeof PointerEvent === "undefined" ? "mousedown" : "pointerdown"
    el.dispatchEvent(new MouseEvent(type, { bubbles: true }))
  }

  const keydown = (el: Element, key: string) => {
    el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }))
  }

  const renderDialog = () => {
    const trigger = document.body.appendChild(document.createElement("button"))
    const closeButton = document.createElement("button")
    // Opening the dialog moves focus into it programmatically
    const open = () => {
      document.body.appendChild(closeButton)
      closeButton.focus()
    }
    return { trigger, closeButton, open }
  }

  it("should set up when the prototype's focus cannot be read", () => {
    installStorybookFocus()

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

  it("should keep focus rings off when a pointer opens a dialog under Storybook", async () => {
    const fv = await loadFresh()
    installStorybookFocus()
    fv.trackFocusVisible()

    const { trigger, closeButton, open } = renderDialog()
    pointerdown(trigger)
    trigger.focus()
    open()

    expect(document.activeElement).toBe(closeButton)
    expect(fv.getInteractionModality()).toBe("pointer")
    expect(fv.isFocusVisible()).toBe(false)
  })

  it("should keep focus rings on when the keyboard opens a dialog under Storybook", async () => {
    const fv = await loadFresh()
    installStorybookFocus()
    fv.trackFocusVisible()

    const { trigger, closeButton, open } = renderDialog()
    trigger.focus()
    keydown(trigger, "Enter")
    open()

    expect(document.activeElement).toBe(closeButton)
    expect(fv.getInteractionModality()).toBe("keyboard")
    expect(fv.isFocusVisible()).toBe(true)
  })

  it("should restore Storybook's accessor on teardown", () => {
    const accessor = installStorybookFocus()
    trackFocusVisible()

    expect(Object.getOwnPropertyDescriptor(HTMLElement.prototype, "focus")?.value).toBeTypeOf("function")

    window.dispatchEvent(new Event("beforeunload"))

    const restored = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "focus")
    expect(restored?.get).toBe(accessor.get)
    expect(restored?.set).toBe(accessor.set)
  })
})
