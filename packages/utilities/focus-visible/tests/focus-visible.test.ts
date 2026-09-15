// @vitest-environment jsdom

import { describe, expect, it } from "vitest"
import { isFocusVisible, trackFocusVisible } from "../src"

describe("focus visible", () => {
  it("should set up when the prototype's focus cannot be read", () => {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "focus")!

    // Storybook's instrumenter replaces `focus` with an accessor that dereferences `this`,
    // so reading it off the prototype throws.
    Object.defineProperty(HTMLElement.prototype, "focus", {
      configurable: true,
      get(this: HTMLElement) {
        return this.ownerDocument.defaultView!.HTMLElement.prototype.focus
      },
    })

    try {
      expect(() => trackFocusVisible()).not.toThrow()

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }))
      expect(isFocusVisible()).toBe(true)
    } finally {
      Object.defineProperty(HTMLElement.prototype, "focus", descriptor)
    }
  })
})
