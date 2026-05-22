// @vitest-environment jsdom

import { afterEach, describe, expect, test, vi } from "vitest"
import { preventBodyScroll } from "../src"

const LOCK_ATTR = "data-scroll-lock"

function isLocked() {
  return document.body.hasAttribute(LOCK_ATTR)
}

function resetBody() {
  document.body.removeAttribute(LOCK_ATTR)
  document.body.removeAttribute("style")
  document.documentElement.style.removeProperty("--scrollbar-width")
}

describe("preventBodyScroll", () => {
  afterEach(() => {
    resetBody()
  })

  test("applies the scroll lock and clears it on cleanup", () => {
    expect(isLocked()).toBe(false)

    const release = preventBodyScroll(document)
    expect(isLocked()).toBe(true)
    expect(document.body.style.overflow).toBe("hidden")

    release()
    expect(isLocked()).toBe(false)
    expect(document.body.style.overflow).toBe("")
  })

  test("returns a cleanup when already locked (ref-counted)", () => {
    const release1 = preventBodyScroll(document)
    const release2 = preventBodyScroll(document)

    expect(typeof release2).toBe("function")
    expect(isLocked()).toBe(true)

    // first release decrements but does not unlock — second caller still holds a claim
    release1()
    expect(isLocked()).toBe(true)
    expect(document.body.style.overflow).toBe("hidden")

    release2()
    expect(isLocked()).toBe(false)
    expect(document.body.style.overflow).toBe("")
  })

  test("releases are idempotent (calling twice does not double-decrement)", () => {
    const release1 = preventBodyScroll(document)
    const release2 = preventBodyScroll(document)

    release1()
    release1()
    release1()

    // release2 still owns the only outstanding lock — calling its release should fully unlock
    expect(isLocked()).toBe(true)

    release2()
    expect(isLocked()).toBe(false)
  })

  test("can lock again after fully releasing", () => {
    const release = preventBodyScroll(document)
    release()
    expect(isLocked()).toBe(false)

    const release2 = preventBodyScroll(document)
    expect(isLocked()).toBe(true)

    release2()
    expect(isLocked()).toBe(false)
  })

  test("simulates the React Strict Mode mount-cleanup-mount sequence without leaking", () => {
    // First mount registers the lock and stashes its cleanup. Strict Mode then runs the
    // setup again before the prior cleanup fires — so a second call must still produce a
    // cleanup whose effects can be unwound when the dialog ultimately closes.
    const releaseFromMount1 = preventBodyScroll(document)
    const releaseFromMount2 = preventBodyScroll(document)

    // dialog later closes; both cleanups run (composed via callAll in the adapter)
    releaseFromMount1()
    releaseFromMount2()

    expect(isLocked()).toBe(false)
    expect(document.body.style.overflow).toBe("")
  })

  test("nested locks across separate callers (e.g. dialog + drawer) unlock cleanly", () => {
    const releaseDialog = preventBodyScroll(document)
    const releaseDrawer = preventBodyScroll(document)

    // close dialog first; drawer still wants the lock
    releaseDialog()
    expect(isLocked()).toBe(true)

    releaseDrawer()
    expect(isLocked()).toBe(false)
  })

  test("does not throw when called repeatedly even with no scroll lock active", () => {
    const release = preventBodyScroll(document)
    release()
    expect(() => release()).not.toThrow()
    expect(isLocked()).toBe(false)
  })

  test("default `document` argument falls back to global", () => {
    const release = preventBodyScroll()
    expect(isLocked()).toBe(true)
    release()
    expect(isLocked()).toBe(false)
  })

  test("isolates locks per document", () => {
    // jsdom only gives us one Document, so emulate a second by stubbing the relevant
    // surface area. The lock map is keyed on the Document instance, so two distinct
    // instances must not collide.
    const otherDoc = document.implementation.createHTMLDocument("other")
    // jsdom synthesised documents do not have a defaultView; provide a minimal one
    Object.defineProperty(otherDoc, "defaultView", { value: window })

    const releaseMain = preventBodyScroll(document)
    const releaseOther = preventBodyScroll(otherDoc)

    expect(document.body.hasAttribute(LOCK_ATTR)).toBe(true)
    expect(otherDoc.body.hasAttribute(LOCK_ATTR)).toBe(true)

    releaseMain()
    expect(document.body.hasAttribute(LOCK_ATTR)).toBe(false)
    expect(otherDoc.body.hasAttribute(LOCK_ATTR)).toBe(true)

    releaseOther()
    expect(otherDoc.body.hasAttribute(LOCK_ATTR)).toBe(false)
  })

  test("warns when called from a stale state object should not regress (smoke)", () => {
    // sanity: ensure we are not leaking between tests — vitest gives each test a clean body
    expect(isLocked()).toBe(false)
    const spy = vi.spyOn(document.body, "removeAttribute")
    const release = preventBodyScroll(document)
    release()
    expect(spy).toHaveBeenCalledWith(LOCK_ATTR)
    spy.mockRestore()
  })
})
