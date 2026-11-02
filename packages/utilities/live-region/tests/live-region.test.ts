// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { createLiveRegion } from "../src"

const regions = () => Array.from(document.querySelectorAll("[data-live-announcer]"))

describe("live region", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ""
  })

  test("announces after the delay", () => {
    const region = createLiveRegion({ level: "polite" })
    region.announce("3 results", 1000)
    expect(regions()[0].textContent).toBe("")
    vi.advanceTimersByTime(1000)
    expect(regions()[0].textContent).toBe("3 results")
    expect(regions()[0].getAttribute("role")).toBe("status")
  })

  test("keeps the same region in the DOM", () => {
    const region = createLiveRegion()
    const [el] = regions()
    region.announce("1 result")
    vi.advanceTimersByTime(200)
    region.announce("2 results")
    vi.advanceTimersByTime(100)
    expect(regions()).toEqual([el])
    expect(el.textContent).toBe("2 results")
  })

  test("clears the region before repeating a message", () => {
    const region = createLiveRegion()
    region.announce("No results")
    vi.advanceTimersByTime(200)
    region.announce("No results")
    expect(regions()[0].textContent).toBe("")
    vi.advanceTimersByTime(100)
    expect(regions()[0].textContent).toBe("No results")
  })

  test("waits for a new region before the first message", () => {
    const region = createLiveRegion()
    region.announce("Apple")
    vi.advanceTimersByTime(100)
    expect(regions()[0].textContent).toBe("")
    vi.advanceTimersByTime(100)
    expect(regions()[0].textContent).toBe("Apple")
  })

  test("adds the region to the root", () => {
    document.body.innerHTML = `<div role="dialog" aria-modal="true"><div id="root"></div></div>`
    createLiveRegion({ root: () => document.getElementById("root") })
    expect(regions()[0].parentElement?.id).toBe("root")
  })

  test("replaces its own pending announcement", () => {
    const region = createLiveRegion()
    region.announce("1 result", 1000)
    region.announce("2 results", 1000)
    vi.advanceTimersByTime(1000)
    expect(regions().map((el) => el.textContent)).toEqual(["2 results"])
  })

  test("leaves other regions alone", () => {
    const results = createLiveRegion({ level: "polite" })
    const alerts = createLiveRegion({ level: "assertive" })
    results.announce("3 results", 1000)
    alerts.announce("Apple")
    vi.advanceTimersByTime(1000)
    expect(regions().map((el) => el.textContent)).toEqual(["3 results", "Apple"])
  })

  test("cancel drops the pending announcement", () => {
    const region = createLiveRegion()
    region.announce("3 results", 1000)
    region.cancel()
    vi.advanceTimersByTime(1000)
    expect(regions()[0].textContent).toBe("")
  })

  test("destroy cancels and removes the region", () => {
    const region = createLiveRegion()
    region.announce("3 results", 1000)
    region.destroy()
    vi.advanceTimersByTime(1000)
    expect(regions()).toHaveLength(0)
  })
})
