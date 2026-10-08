// @vitest-environment jsdom

import { afterEach, describe, expect, test } from "vitest"
import { hideOthers, inertOthers } from "../src/aria-hidden"

// Each dialog sits in its own portal at the body level, mounted before any dialog opens
function setup() {
  document.body.innerHTML = `
    <main id="main"><button id="page-button"></button></main>
    <div id="portal-1"><div id="dialog-1"><button id="menu-trigger" aria-controls="menu" aria-expanded="false"></button></div></div>
    <div id="portal-2"><div id="dialog-2"></div></div>
    <div id="portal-3"><div id="dialog-3"></div></div>
    <div id="menu-portal"><div id="menu" role="menu"><div id="menu-item" role="menuitem"></div></div></div>
  `
  return (id: string) => document.getElementById(id)!
}

const isHidden = (el: Element) => el.getAttribute("aria-hidden") === "true"

const visibleIds = () =>
  ["main", "portal-1", "portal-2", "portal-3", "menu-portal"].filter((id) => !isHidden(document.getElementById(id)!))

const flush = () => new Promise((resolve) => setTimeout(resolve))

describe("hideOthers", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  test("hides everything outside the target and restores it", () => {
    const get = setup()
    const undo = hideOthers(get("dialog-1"))!

    expect(visibleIds()).toEqual(["portal-1"])

    undo()

    expect(document.querySelectorAll("[aria-hidden], [data-aria-hidden]")).toHaveLength(0)
  })

  test("keeps a nested target visible when its portal was mounted earlier", () => {
    const get = setup()
    const undo1 = hideOthers(get("dialog-1"))!
    const undo2 = hideOthers(get("dialog-2"))!

    expect(visibleIds()).toEqual(["portal-2"])

    undo2()
    expect(visibleIds()).toEqual(["portal-1"])

    undo1()
    expect(document.querySelectorAll("[aria-hidden], [data-aria-hidden]")).toHaveLength(0)
  })

  test("restores the middle target when the top of three closes", () => {
    const get = setup()
    const undo1 = hideOthers(get("dialog-1"))!
    const undo2 = hideOthers(get("dialog-2"))!
    const undo3 = hideOthers(get("dialog-3"))!

    expect(visibleIds()).toEqual(["portal-3"])

    undo3()
    expect(visibleIds()).toEqual(["portal-2"])

    undo2()
    expect(visibleIds()).toEqual(["portal-1"])

    undo1()
    expect(document.querySelectorAll("[aria-hidden], [data-aria-hidden]")).toHaveLength(0)
  })

  test("keeps the top target visible when an earlier lock is released first", () => {
    const get = setup()
    const undo1 = hideOthers(get("dialog-1"))!
    const undo2 = hideOthers(get("dialog-2"))!
    const undo3 = hideOthers(get("dialog-3"))!

    undo1()
    expect(visibleIds()).toEqual(["portal-3"])

    undo2()
    expect(visibleIds()).toEqual(["portal-3"])

    undo3()
    expect(document.querySelectorAll("[aria-hidden], [data-aria-hidden]")).toHaveLength(0)
  })

  test("resumes the lock below when the top is released after a middle one", () => {
    const get = setup()
    const undo1 = hideOthers(get("dialog-1"))!
    const undo2 = hideOthers(get("dialog-2"))!
    const undo3 = hideOthers(get("dialog-3"))!

    undo2()
    expect(visibleIds()).toEqual(["portal-3"])

    undo3()
    expect(visibleIds()).toEqual(["portal-1"])

    undo1()
    expect(document.querySelectorAll("[aria-hidden], [data-aria-hidden]")).toHaveLength(0)
  })

  test("ignores a second release of the same lock", () => {
    const get = setup()
    const undo1 = hideOthers(get("dialog-1"))!
    const undo2 = hideOthers(get("dialog-2"))!

    undo2()
    undo2()

    expect(visibleIds()).toEqual(["portal-1"])
    undo1()
  })

  test("never reveals a node that was hidden before any lock", () => {
    const get = setup()
    get("portal-2").setAttribute("aria-hidden", "true")

    const undo1 = hideOthers(get("dialog-1"))!
    const undo3 = hideOthers(get("dialog-3"))!

    expect(isHidden(get("portal-2"))).toBe(true)

    undo3()
    expect(isHidden(get("portal-2"))).toBe(true)

    undo1()
    expect(isHidden(get("portal-2"))).toBe(true)
    expect(get("portal-2").hasAttribute("data-aria-hidden")).toBe(false)
  })

  test("reveals a popup when its controller inside the target expands", async () => {
    const get = setup()
    const undo = hideOthers(get("dialog-1"))!

    expect(isHidden(get("menu-portal"))).toBe(true)

    get("menu-trigger").setAttribute("aria-expanded", "true")
    await flush()
    expect(visibleIds()).toEqual(["portal-1", "menu-portal"])
    expect(get("menu-item").closest("[aria-hidden='true']")).toBeNull()

    get("menu-trigger").setAttribute("aria-expanded", "false")
    await flush()
    expect(visibleIds()).toEqual(["portal-1"])

    undo()
    expect(document.querySelectorAll("[aria-hidden], [data-aria-hidden]")).toHaveLength(0)
  })

  test("does not touch nodes that stay hidden when re-walking", async () => {
    const get = setup()
    const undo = hideOthers(get("dialog-1"))!

    const changed: string[] = []
    const recorder = new MutationObserver((records) => {
      records.forEach((r) => changed.push((r.target as Element).id))
    })
    recorder.observe(document.body, { attributes: true, attributeFilter: ["aria-hidden"], subtree: true })

    get("menu-trigger").setAttribute("aria-expanded", "true")
    await flush()
    get("menu-trigger").setAttribute("aria-expanded", "false")
    await flush()

    recorder.disconnect()
    expect(changed).toEqual(["menu-portal", "menu-portal"])
    undo()
  })

  test("ignores controllers inside hidden content", async () => {
    const get = setup()
    const pageButton = get("page-button")
    pageButton.setAttribute("aria-controls", "menu")
    pageButton.setAttribute("aria-expanded", "false")

    const undo = hideOthers(get("dialog-1"))!
    pageButton.setAttribute("aria-expanded", "true")
    await flush()

    expect(isHidden(get("menu-portal"))).toBe(true)
    undo()
  })

  test("only the topmost lock reacts to controllers", async () => {
    const get = setup()
    const undo1 = hideOthers(get("dialog-1"))!
    const undo2 = hideOthers(get("dialog-2"))!

    get("menu-trigger").setAttribute("aria-expanded", "true")
    await flush()
    expect(visibleIds()).toEqual(["portal-2"])

    undo2()
    expect(visibleIds()).toEqual(["portal-1", "menu-portal"])

    undo1()
  })

  test("does nothing when the target is no longer in the document", () => {
    const get = setup()
    const detached = get("dialog-1")
    detached.remove()

    const undo = hideOthers(detached)
    expect(document.querySelectorAll("[aria-hidden]")).toHaveLength(0)
    undo?.()
  })
})

describe("inertOthers", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  test("applies only the topmost lock", () => {
    const get = setup()
    const isInert = (id: string) => get(id).hasAttribute("inert")

    const undo1 = inertOthers(get("dialog-1"))!
    const undo2 = inertOthers(get("dialog-2"))!
    const undo3 = inertOthers(get("dialog-3"))!

    expect(isInert("portal-3")).toBe(false)
    expect(isInert("portal-2")).toBe(true)

    undo3()
    expect(isInert("portal-2")).toBe(false)
    expect(isInert("portal-1")).toBe(true)

    undo2()
    undo1()
    expect(document.querySelectorAll("[inert], [data-inerted]")).toHaveLength(0)
  })
})

describe("shadow DOM", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  test("treats a target inside a shadow root as its host", () => {
    document.body.innerHTML = `<div id="host"></div><div id="portal"><div id="dialog-2"></div></div>`
    const host = document.getElementById("host")!
    const portal = document.getElementById("portal")!
    const shadow = host.attachShadow({ mode: "open" })
    shadow.innerHTML = `<div id="dialog-1"></div>`

    const undo1 = hideOthers(shadow.getElementById("dialog-1")!)!
    expect([isHidden(host), isHidden(portal)]).toEqual([false, true])

    const undo2 = hideOthers(document.getElementById("dialog-2")!)!
    expect([isHidden(host), isHidden(portal)]).toEqual([true, false])

    undo2()
    expect([isHidden(host), isHidden(portal)]).toEqual([false, true])

    undo1()
    expect(document.querySelectorAll("[aria-hidden], [data-aria-hidden]")).toHaveLength(0)
  })

  test("keeps a shadow host visible when opened after a light DOM target", () => {
    document.body.innerHTML = `<div id="portal"><div id="dialog-1"></div></div><div id="host"></div>`
    const host = document.getElementById("host")!
    const portal = document.getElementById("portal")!
    const shadow = host.attachShadow({ mode: "open" })
    shadow.innerHTML = `<div id="dialog-2"></div>`

    const undo1 = hideOthers(document.getElementById("dialog-1")!)!
    const undo2 = hideOthers(shadow.getElementById("dialog-2")!)!
    expect([isHidden(portal), isHidden(host)]).toEqual([true, false])

    undo2()
    expect([isHidden(portal), isHidden(host)]).toEqual([false, true])

    undo1()
    expect(document.querySelectorAll("[aria-hidden], [data-aria-hidden]")).toHaveLength(0)
  })
})
