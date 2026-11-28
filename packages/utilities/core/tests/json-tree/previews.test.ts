import { describe, expect, test } from "vitest"
import { getAccessibleDescription, getNodeTypeDescription, jsonNodeToElement, jsonToTree } from "../../src/json-tree"
import { elementText } from "./test-utils"

// what a tree row shows for a value: its preview, its type description and its accessible label
const show = (value: unknown) => {
  const node = jsonToTree(value)
  return {
    preview: elementText(jsonNodeToElement(node)),
    description: getNodeTypeDescription(node),
    label: getAccessibleDescription(node),
  }
}

describe("previews", () => {
  test("primitives", () => {
    expect([show("a\nb"), show(42), show(true), show(null), show(undefined), show(10n), show(Symbol("s"))])
      .toMatchInlineSnapshot(`
        [
          {
            "description": ""a\\nb"",
            "label": ""a
        b"",
            "preview": ""a\\nb"",
          },
          {
            "description": "42",
            "label": "42",
            "preview": "42",
          },
          {
            "description": "true",
            "label": "true",
            "preview": "true",
          },
          {
            "description": "null",
            "label": "null",
            "preview": "null",
          },
          {
            "description": "undefined",
            "label": "undefined",
            "preview": "undefined",
          },
          {
            "description": "10n",
            "label": "10n",
            "preview": "10n",
          },
          {
            "description": "Symbol(s)",
            "label": "Symbol(s)",
            "preview": "Symbol(s)",
          },
        ]
      `)
  })

  test("long strings collapse in the description", () => {
    expect(show("a".repeat(40))).toMatchInlineSnapshot(`
      {
        "description": ""aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa…"",
        "label": ""aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"",
        "preview": ""aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"",
      }
    `)
  })

  test("objects, class instances and arrays", () => {
    class Point {
      x = 1
      y = 2
    }
    expect([show({ a: 1, b: "two", c: [1], d: { e: 1 } }), show(new Point()), show([1, "a", null, { x: 1 }])])
      .toMatchInlineSnapshot(`
        [
          {
            "description": "Object",
            "label": "Object, expandable with 4 properties",
            "preview": "{ a: 1, b: "two", c: Array(1), … }",
          },
          {
            "description": "Point",
            "label": "Point, expandable with 2 properties",
            "preview": "Point { x: 1, y: 2 }",
          },
          {
            "description": "Array(4)",
            "label": "Array(4), expandable with 5 properties",
            "preview": "(4) [ 1, "a", null, … ]",
          },
        ]
      `)
  })

  test("collections", () => {
    expect([
      show(new Set([1, "two"])),
      show(
        new Map<unknown, unknown>([
          ["k", 1],
          [2, { v: 2 }],
        ]),
      ),
      show(new WeakSet()),
      show(new WeakMap()),
    ]).toMatchInlineSnapshot(`
      [
        {
          "description": "Set(2)",
          "label": "Set(2), expandable with 2 properties",
          "preview": "Set(2) { 1, "two" }",
        },
        {
          "description": "Map(2)",
          "label": "Map(2), expandable with 2 properties",
          "preview": "Map(2) { "k" => 1, 2 => Object }",
        },
        {
          "description": "WeakSet",
          "label": "WeakSet",
          "preview": "WeakSet { [[Entries]]: not enumerable }",
        },
        {
          "description": "WeakMap",
          "label": "WeakMap",
          "preview": "WeakMap { [[Entries]]: not enumerable }",
        },
      ]
    `)
  })

  test("typed arrays and buffers", () => {
    expect([
      show(new Uint8Array([1, 2, 3, 4, 5, 6, 7])),
      show(new ArrayBuffer(8)),
      show(new DataView(new ArrayBuffer(4), 1)),
    ]).toMatchInlineSnapshot(`
      [
        {
          "description": "Uint8Array(7)",
          "label": "Uint8Array(7), expandable with 5 properties",
          "preview": "Uint8Array(7) [ 1, 2, 3, 4, 5, … ]",
        },
        {
          "description": "ArrayBuffer(8)",
          "label": "ArrayBuffer(8)",
          "preview": "ArrayBuffer(8)",
        },
        {
          "description": "DataView(3)",
          "label": "DataView(3), expandable with 3 properties",
          "preview": "DataView(3) { buffer: ArrayBuffer(4), byteOffset: 1 }",
        },
      ]
    `)
  })

  test("functions", () => {
    async function load(id: string) {
      return id
    }
    function* items() {}
    expect([show(load), show(items), show((x: number) => x)]).toMatchInlineSnapshot(`
      [
        {
          "description": "async ƒ load()",
          "label": "async ƒ load(), expandable with 4 properties",
          "preview": "async ƒ load(id)",
        },
        {
          "description": "ƒ* items()",
          "label": "ƒ* items(), expandable with 4 properties",
          "preview": "ƒ* items()",
        },
        {
          "description": "ƒ anonymous()",
          "label": "ƒ anonymous(), expandable with 4 properties",
          "preview": "ƒ (x)",
        },
      ]
    `)
  })

  test("errors and regexes", () => {
    expect([show(new TypeError("bad")), show(/ab+c/gi)]).toMatchInlineSnapshot(`
      [
        {
          "description": "TypeError: bad",
          "label": "TypeError: bad, expandable with 3 properties",
          "preview": "TypeError: bad",
        },
        {
          "description": "/ab+c/gi",
          "label": "/ab+c/gi, expandable with 10 properties",
          "preview": "/ab+c/gi",
        },
      ]
    `)
  })

  // the description is in local time, so only the UTC preview is fixed
  test("dates", () => {
    expect(elementText(jsonNodeToElement(jsonToTree(new Date(0))))).toMatchInlineSnapshot(`"1970-01-01T00:00:00.000Z"`)
  })

  test("web platform objects", () => {
    expect([
      show(new URL("https://example.com:8080/p?x=1")),
      show(new URLSearchParams("a=1&b=2")),
      show(new Headers({ accept: "*/*", "content-type": "json" })),
      show(new Blob(["abc"], { type: "text/plain" })),
    ]).toMatchInlineSnapshot(`
      [
        {
          "description": "URL",
          "label": "URL, expandable with 12 properties",
          "preview": "URL { href: 'https://example.com:8080/p?x=1', origin: 'https://example.com:8080', protocol: 'https:', … }",
        },
        {
          "description": "URLSearchParams",
          "label": "URLSearchParams, expandable with 2 properties",
          "preview": "URLSearchParams { size: 2 }",
        },
        {
          "description": "Headers",
          "label": "Headers, expandable with 1 property",
          "preview": "Headers(2) { accept: */*, content-type: json }",
        },
        {
          "description": "Blob(3)",
          "label": "Blob(3), expandable with 2 properties",
          "preview": "Blob { size: 3, type: 'text/plain' }",
        },
      ]
    `)
  })

  test("react elements", () => {
    const element = { $$typeof: Symbol.for("react.element"), type: "div", key: null, ref: null, props: { id: "x" } }
    expect(show(element)).toMatchInlineSnapshot(`
      {
        "description": "div",
        "label": "div, expandable with 5 properties",
        "preview": "<div id="x" />",
      }
    `)
  })
})
