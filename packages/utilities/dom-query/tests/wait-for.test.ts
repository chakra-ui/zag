// @vitest-environment jsdom

import { afterEach, describe, expect, test, vi } from "vitest"
import { waitForElement } from "../src/wait-for"

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

describe("waitForElement", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ""
  })

  test("resolves when the element is added", async () => {
    const [promise] = waitForElement(() => document.getElementById("target"), { timeout: 1000 })
    const el = document.createElement("div")
    el.id = "target"
    document.body.appendChild(el)
    await expect(promise).resolves.toBe(el)
  })

  test("disconnects the observer when aborted", async () => {
    const disconnect = vi.spyOn(MutationObserver.prototype, "disconnect")
    const [promise, abort] = waitForElement(() => document.getElementById("missing"), { timeout: 1000 })
    abort()
    await expect(promise).rejects.toThrow()
    await flush()
    expect(disconnect).toHaveBeenCalled()
  })

  test("disconnects the observer on timeout", async () => {
    const disconnect = vi.spyOn(MutationObserver.prototype, "disconnect")
    const [promise] = waitForElement(() => document.getElementById("missing"), { timeout: 10 })
    await expect(promise).rejects.toThrow(/Timeout/)
    await flush()
    expect(disconnect).toHaveBeenCalled()
  })
})
