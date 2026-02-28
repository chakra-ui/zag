import { JSDOM } from "jsdom"
import { describe, expect, test } from "vitest"
import { FocusTrap } from "../src"

describe("@zag-js/focus-trap", () => {
  test("default key handlers should tolerate undefined events", () => {
    const { document } = new JSDOM(`<div></div>`).window
    const container = document.createElement("div")
    document.body.appendChild(container)

    const trap = new FocusTrap(container, { document })
    const { isKeyForward, isKeyBackward } = (trap as any).config

    expect(() => isKeyForward?.(undefined as any)).not.toThrow()
    expect(() => isKeyBackward?.(undefined as any)).not.toThrow()
    expect(isKeyForward?.(undefined as any)).toBe(false)
    expect(isKeyBackward?.(undefined as any)).toBe(false)
  })
})
