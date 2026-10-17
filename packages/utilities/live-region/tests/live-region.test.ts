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
