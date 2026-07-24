// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest"
import { trackInteractOutside } from "../src"

describe("trackInteractOutside", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("detects focus outside when focus moves within the same shadow root", () => {
    const host = document.createElement("div")
    const root = host.attachShadow({ mode: "open" })

    const content = document.createElement("div")
    const inside = document.createElement("button")
    const outside = document.createElement("button")

    content.append(inside)
    root.append(content, outside)
    document.body.append(host)

    const onFocusOutside = vi.fn()
    const cleanup = trackInteractOutside(content, { onFocusOutside })

    outside.dispatchEvent(new FocusEvent("focusin", { bubbles: true }))

    expect(onFocusOutside).toHaveBeenCalledTimes(1)
    cleanup()
  })
})
