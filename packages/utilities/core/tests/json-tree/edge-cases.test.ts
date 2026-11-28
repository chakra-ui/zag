import { describe, expect, test } from "vitest"
import { getAccessibleDescription, jsonNodeToElement, jsonToTree } from "../../src/json-tree"
import { elementText, printTree } from "./test-utils"

const preview = (value: unknown) => elementText(jsonNodeToElement(jsonToTree(value)))

describe("edge cases", () => {
  test("empty values", () => {
    expect([preview({}), preview([]), preview(new Set()), preview(new Map()), preview(""), preview(Promise.resolve())])
      .toMatchInlineSnapshot(`
        [
          "{}",
          "[]",
          "Set(0) {}",
          "Map(0) {}",
          """",
          "Promise {}",
        ]
      `)
  })

  test("special numbers", () => {
    expect([preview(-0), preview(NaN), preview(Infinity), preview(-Infinity), preview(Number.MAX_SAFE_INTEGER)])
      .toMatchInlineSnapshot(`
        [
          "0",
          "NaN",
          "Infinity",
          "-Infinity",
          "9007199254740991",
        ]
      `)
  })

  test("objects without a prototype show as plain objects", () => {
    const value = Object.assign(Object.create(null), { a: 1 })
    expect(printTree(jsonToTree(value))).toMatchInlineSnapshot(`
      "$: object  { a: 1 }
        a: number  1"
    `)
  })

  test("a getter that throws shows its error instead of breaking the tree", () => {
    const value = {
      ok: 1,
      get broken() {
        throw new Error("nope")
      },
    }
    expect(printTree(jsonToTree(value), 1)).toMatchInlineSnapshot(`
      "$: object  { ok: 1, broken: Error: nope }
        ok: number  1
        broken: error  Error: nope"
    `)
  })

  test("the same object in two places is not circular", () => {
    const shared = { x: 1 }
    expect(printTree(jsonToTree({ a: shared, b: shared }))).toMatchInlineSnapshot(`
      "$: object  { a: Object, b: Object }
        a: object  { x: 1 }
          x: number  1
        b: object  { x: 1 }
          x: number  1"
    `)
  })

  test("a cycle further down is circular", () => {
    const parent: any = { child: {} }
    parent.child.parent = parent
    expect(printTree(jsonToTree(parent))).toMatchInlineSnapshot(`
      "$: object  { child: Object }
        child: object  { parent: [Circular] }
          parent: circular  [Circular]"
    `)
  })

  test("symbol keys are skipped, frozen objects and proxies read normally", () => {
    const proxy = new Proxy({ a: 1 }, {})
    expect([preview({ [Symbol("k")]: 1, a: 2 }), preview(Object.freeze({ a: 1 })), preview(proxy)])
      .toMatchInlineSnapshot(`
      [
        "{ a: 2 }",
        "{ a: 1 }",
        "{ a: 1 }",
      ]
    `)
  })

  test("Symbol.toStringTag doesn't change how a plain object reads", () => {
    expect(preview({ [Symbol.toStringTag]: "Custom", a: 1 })).toMatchInlineSnapshot(`"{ a: 1 }"`)
  })

  test("strings escape newlines and tabs, and keep quotes", () => {
    expect([preview('say "hi"\n\tthere'), getAccessibleDescription(jsonToTree("a\nb"))]).toMatchInlineSnapshot(`
      [
        ""say "hi"\\n\\tthere"",
        ""a
      b"",
      ]
    `)
  })

  test("deep nesting stops at the depth limit", () => {
    const value = JSON.parse("[".repeat(25) + "]".repeat(25))
    let node = jsonToTree(value)
    let depth = 0
    while (node.children?.[0] && node.type === "array") {
      node = node.children[0]
      depth++
    }
    expect({ depth, value: node.value }).toMatchInlineSnapshot(`
      {
        "depth": 21,
        "value": "[Max Depth Reached]",
      }
    `)
  })

  test("an array exactly at the grouping limit isn't grouped", () => {
    const options = {
      maxPreviewItems: 3,
      collapseStringsAfterLength: 30,
      groupArraysAfterLength: 3,
      showNonenumerable: true,
    }
    const childKeys = (length: number) =>
      jsonToTree(
        Array.from({ length }, (_, i) => i),
        { options },
      ).children?.map((child) => child.keyPath.at(-1))
    expect([childKeys(3), childKeys(4)]).toMatchInlineSnapshot(`
      [
        [
          "0",
          "1",
          "2",
          "length",
        ],
        [
          "[0…2]",
          "[3…3]",
          "length",
        ],
      ]
    `)
  })
})
