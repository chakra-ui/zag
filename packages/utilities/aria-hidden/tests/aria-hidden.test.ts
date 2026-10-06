// @vitest-environment jsdom

import { afterEach, describe, expect, test } from "vitest"
import { hideOthers } from "../src/aria-hidden"

function setup() {
  document.body.innerHTML = `
    <main id="main"></main>
    <div id="parent-portal"><div id="parent"></div></div>
    <div id="nested-portal"><div id="nested"></div></div>
  `
  const get = (id: string) => document.getElementById(id)!
  return {
    main: get("main"),
    parentPortal: get("parent-portal"),
    parent: get("parent"),
    nestedPortal: get("nested-portal"),
    nested: get("nested"),
  }
}

describe("hideOthers", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  test("hides siblings of the target", () => {
    const { main, parentPortal, parent, nestedPortal } = setup()
    const undo = hideOthers(parent)!

    expect(main.getAttribute("aria-hidden")).toBe("true")
    expect(nestedPortal.getAttribute("aria-hidden")).toBe("true")
    expect(parentPortal.hasAttribute("aria-hidden")).toBe(false)

    undo()

    expect(main.hasAttribute("aria-hidden")).toBe(false)
    expect(nestedPortal.hasAttribute("aria-hidden")).toBe(false)
  })

  test("reveals a target hidden by a previous lock", () => {
    const { main, parentPortal, parent, nestedPortal, nested } = setup()
    const undoParent = hideOthers(parent)!

    expect(nestedPortal.getAttribute("aria-hidden")).toBe("true")

    const undoNested = hideOthers(nested)!

    expect(nestedPortal.hasAttribute("aria-hidden")).toBe(false)
    expect(parentPortal.getAttribute("aria-hidden")).toBe("true")
    expect(main.getAttribute("aria-hidden")).toBe("true")

    undoNested()

    expect(nestedPortal.getAttribute("aria-hidden")).toBe("true")
    expect(parentPortal.hasAttribute("aria-hidden")).toBe(false)
    expect(main.getAttribute("aria-hidden")).toBe("true")

    undoParent()

    expect(document.querySelectorAll("[aria-hidden]")).toHaveLength(0)
    expect(document.querySelectorAll("[data-aria-hidden]")).toHaveLength(0)
  })

  test("keeps ancestors revealed when the previous lock is released first", () => {
    const { main, parentPortal, parent, nestedPortal, nested } = setup()
    const undoParent = hideOthers(parent)!
    const undoNested = hideOthers(nested)!

    undoParent()

    expect(nestedPortal.hasAttribute("aria-hidden")).toBe(false)
    expect(parentPortal.getAttribute("aria-hidden")).toBe("true")
    expect(main.getAttribute("aria-hidden")).toBe("true")

    undoNested()

    expect(document.querySelectorAll("[aria-hidden]")).toHaveLength(0)
  })

  test("does not reveal ancestors hidden by the user", () => {
    const { parent, nestedPortal, nested } = setup()
    nestedPortal.setAttribute("aria-hidden", "true")

    const undoParent = hideOthers(parent)!
    const undoNested = hideOthers(nested)!

    expect(nestedPortal.getAttribute("aria-hidden")).toBe("true")

    undoNested()
    undoParent()

    expect(nestedPortal.getAttribute("aria-hidden")).toBe("true")
  })
})
