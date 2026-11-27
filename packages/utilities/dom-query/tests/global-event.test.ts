// @vitest-environment jsdom

import { describe, expect, test, vi } from "vitest"
import { addGlobalEvent } from "../src/global-event"

describe("addGlobalEvent", () => {
  test("shares one native listener between handlers and removes it after the last one", () => {
    const target = new EventTarget()
    const add = vi.spyOn(target, "addEventListener")
    const remove = vi.spyOn(target, "removeEventListener")
    const a = vi.fn()
    const b = vi.fn()

    const offA = addGlobalEvent(target, "ping", a)
    const offB = addGlobalEvent(target, "ping", b)
    expect(add).toHaveBeenCalledTimes(1)

    target.dispatchEvent(new Event("ping"))
    expect(a).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledTimes(1)

    offA()
    expect(remove).not.toHaveBeenCalled()
    offB()
    expect(remove).toHaveBeenCalledTimes(1)
  })

  test("keeps capture listeners apart from bubbling ones", () => {
    const target = new EventTarget()
    const add = vi.spyOn(target, "addEventListener")
    addGlobalEvent(target, "ping", () => {})
    addGlobalEvent(target, "ping", () => {}, { capture: true })
    expect(add).toHaveBeenCalledTimes(2)
  })

  test("doesn't skip a handler when another removes itself during dispatch", () => {
    const target = new EventTarget()
    const later = vi.fn()
    const off = addGlobalEvent(target, "ping", () => off())
    addGlobalEvent(target, "ping", later)

    target.dispatchEvent(new Event("ping"))
    expect(later).toHaveBeenCalledTimes(1)
  })
})
