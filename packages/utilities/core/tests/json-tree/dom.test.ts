// @vitest-environment jsdom
import { describe, expect, test } from "vitest"
import { DocumentType, ElementType, WindowType, getDataType, jsonToTree } from "../../src/json-tree"
import { printTree } from "./test-utils"

describe("DOM values", () => {
  test("elements show their tag, id and classes, and read attributes and styles as objects", () => {
    document.body.innerHTML = `<div id="app" class="a b c d" data-x="1" style="color: red"></div>`
    const el = document.getElementById("app")!
    expect(getDataType(el)).toBe(ElementType)
    expect(printTree(jsonToTree(el), 2)).toMatchInlineSnapshot(`
      "$: element  HTMLDivElement <div#app.a.b.c>
        attributes: object  { id: "app", class: "a b c d", data-x: "1", … }
          id: string  "app"
          class: string  "a b c d"
          data-x: string  "1"
          style: string  "color: red"
        childElementCount: number  0
        className: string  "a b c d"
        dataset: object  DOMStringMap { x: "1" }
          x: string  "1"
        hidden: boolean  false
        id: string  "app"
        inert: undefined  undefined
        isConnected: boolean  true
        isContentEditable: undefined  undefined
        nodeType: number  1
        style: object  { color: "red" }
          color: string  "red"
        tabIndex: number  -1
        tagName: string  "DIV""
    `)
  })

  test("svg elements", () => {
    document.body.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"></svg>`
    expect(printTree(jsonToTree(document.querySelector("svg")), 0)).toMatchInlineSnapshot(
      `"$: element  SVGSVGElement <svg>"`,
    )
  })

  test("elements without attributes or styles", () => {
    const el = document.createElement("span")
    const tree = jsonToTree(el)
    const read = (key: string) => tree.children?.find((child) => child.keyPath.at(-1) === key)?.value
    expect({ attributes: read("attributes"), style: read("style") }).toMatchInlineSnapshot(`
      {
        "attributes": undefined,
        "style": undefined,
      }
    `)
  })

  test("documents and windows", () => {
    expect([getDataType(document) === DocumentType, getDataType(window) === WindowType]).toEqual([true, true])
    expect([printTree(jsonToTree(document), 0), printTree(jsonToTree(window), 0)]).toMatchInlineSnapshot(`
      [
        "$: document  #document (http://localhost:3000/)",
        "$: window  Window { … }",
      ]
    `)
  })
})
