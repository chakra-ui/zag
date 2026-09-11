// @vitest-environment jsdom

import { afterEach, beforeAll, describe, expect, test } from "vitest"
import { ariaHidden } from "../src"

beforeAll(() => {
  // Force the inert branch of `suppressOthers`, which checks for this property.
  if (!HTMLElement.prototype.hasOwnProperty("inert")) {
    Object.defineProperty(HTMLElement.prototype, "inert", { value: false, writable: true, configurable: true })
  }
})

afterEach(() => {
  document.body.innerHTML = ""
})

describe("ariaHidden", () => {
  test("makes sibling content inert and restores it on cleanup", () => {
    document.body.innerHTML = `
      <a id="outside" style="pointer-events: auto">link</a>
      <div id="dialog"><button>close</button></div>
    `
    const outside = document.getElementById("outside")!
    const dialog = document.getElementById("dialog")!

    const restore = ariaHidden([dialog], { defer: false })!

    // Inert blocks pointer events even when the element sets pointer-events: auto.
    expect(outside.hasAttribute("inert")).toBe(true)
    // The dialog itself stays interactive.
    expect(dialog.hasAttribute("inert")).toBe(false)

    restore()
    expect(outside.hasAttribute("inert")).toBe(false)
  })
})
