// @vitest-environment jsdom

import { isAndroid, isLinux, isMac } from "../src/platform"

const stubNavigator = (platform: string, userAgent: string) => {
  vi.stubGlobal("navigator", { platform, userAgent, vendor: "", maxTouchPoints: 0 })
}

describe("isLinux", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("should detect desktop linux", () => {
    stubNavigator("Linux x86_64", "Mozilla/5.0 (X11; Linux x86_64) Firefox/120")
    expect(isLinux()).toBe(true)
  })

  it("should detect chrome os", () => {
    stubNavigator("Linux x86_64", "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) Chrome/120")
    expect(isLinux()).toBe(true)
  })

  it("should detect chrome os via userAgentData", () => {
    vi.stubGlobal("navigator", {
      userAgentData: { platform: "Chrome OS", brands: [{ brand: "Google Chrome", version: "143" }] },
      platform: "Linux x86_64",
      userAgent: "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) Chrome/143",
      vendor: "Google Inc.",
      maxTouchPoints: 0,
    })
    expect(isLinux()).toBe(true)
  })

  it("should exclude android via userAgentData", () => {
    vi.stubGlobal("navigator", {
      userAgentData: { platform: "Android", brands: [{ brand: "Google Chrome", version: "143" }] },
      platform: "Linux armv81",
      userAgent: "Mozilla/5.0 (Linux; Android 10; K) Chrome/143 Mobile",
      vendor: "Google Inc.",
      maxTouchPoints: 5,
    })
    expect(isLinux()).toBe(false)
  })

  it("should exclude android", () => {
    stubNavigator("Linux armv8l", "Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/120")
    expect(isLinux()).toBe(false)
    expect(isAndroid()).toBe(true)
  })

  it("should be false on mac and windows", () => {
    stubNavigator("MacIntel", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605")
    expect(isLinux()).toBe(false)
    expect(isMac()).toBe(true)

    stubNavigator("Win32", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120")
    expect(isLinux()).toBe(false)
  })
})
