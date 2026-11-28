import { describe, expect, test } from "vitest"
import {
  getAccessibleDescription,
  getNodeTypeDescription,
  getPreviewOptions,
  getRootNode,
  isRootKeyPath,
  jsonNodeToElement,
  jsonPathToValue,
  jsonToTree,
  keyPathToId,
  keyPathToKey,
  nodeToString,
  nodeToValue,
} from "../../src/json-tree"
import { elementText, printTree } from "./test-utils"

const hidden = getPreviewOptions({ showNonenumerable: false })

describe("tree structure", () => {
  test("nested objects and arrays", () => {
    expect(printTree(jsonToTree({ user: { name: "Ada", tags: ["a", "b"] }, active: true }))).toMatchInlineSnapshot(`
      "$: object  { user: Object, active: true }
        user: object  { name: "Ada", tags: Array(2) }
          name: string  "Ada"
          tags: array  (2) [ "a", "b" ]
            0: string  "a"
            1: string  "b"
            length: number  2
        active: boolean  true"
    `)
  })

  test("sets list their items under [[Entries]]", () => {
    expect(printTree(jsonToTree(new Set(["a", 1])))).toMatchInlineSnapshot(`
      "$: set  Set(2) { "a", 1 }
        [[Entries]]: array (hidden)  (2) [ "a", 1 ]
          0: string  "a"
          1: number  1
        size: number  2"
    `)
  })

  test("maps list each entry as a key and a value", () => {
    expect(
      printTree(
        jsonToTree(
          new Map<unknown, unknown>([
            ["id", 1],
            [{ x: 1 }, "object key"],
          ]),
        ),
      ),
    ).toMatchInlineSnapshot(`
      "$: map  Map(2) { "id" => 1, Object => "object key" }
        [[Entries]]: array (hidden)  (2) [ {…}, {…} ]
          0: object  { key: "id", value: 1 }
            key: string  "id"
            value: number  1
          1: object  { key: Object, value: "object key" }
            key: object  { x: 1 }
              x: number  1
            value: string  "object key"
        size: number  2"
    `)
  })

  test("search params, headers and form data list their pairs", () => {
    const form = new FormData()
    form.append("tag", "a")
    form.append("tag", "b")
    expect(
      [
        printTree(jsonToTree(new URLSearchParams("q=zag")), 2),
        printTree(jsonToTree(new Headers({ accept: "*/*" })), 2),
        printTree(jsonToTree(form), 3),
      ].join("\n\n"),
    ).toMatchInlineSnapshot(`
      "$: urlsearchparams  URLSearchParams { size: 1 }
        [[Entries]]: array (hidden)  (1) [ {…} ]
          0: object  { key: "q", value: "zag" }
        size: number  1

      $: headers  Headers(1) { accept: */* }
        [[Entries]]: array (hidden)  (1) [ {…} ]
          0: object  { key: "accept", value: "*/*" }

      $: formdata  FormData(2) { tag: a, tag: b }
        [[Entries]]: array (hidden)  (2) [ {…}, {…} ]
          0: object  { key: "tag", value: "a" }
            key: string  "tag"
            value: string  "a"
          1: object  { key: "tag", value: "b" }
            key: string  "tag"
            value: string  "b""
    `)
  })

  test("large arrays are grouped into ranges", () => {
    const options = getPreviewOptions({ groupArraysAfterLength: 3 })
    expect(printTree(jsonToTree([1, 2, 3, 4, 5, 6, 7], { options }), 1)).toMatchInlineSnapshot(`
      "$: array  (7) [ […], […], […] ]
        [0…2]: array  (3) [ 1, 2, 3 ]
        [3…5]: array  (3) [ 4, 5, 6 ]
        [6…6]: array  (1) [ 7 ]
        length: number  7"
    `)
  })

  test("sparse arrays only show the slots that hold a value", () => {
    const value: unknown[] = []
    value[2] = "two"
    value[5] = "five"
    expect(printTree(jsonToTree(value))).toMatchInlineSnapshot(`
      "$: array  (6) [ "two", "five" ]
        2: string  "two"
        5: string  "five"
        length: number  6"
    `)
  })

  test("named array properties are shown as hidden properties", () => {
    const value: any = [1]
    value.meta = "info"
    expect([printTree(jsonToTree(value)), printTree(jsonToTree(value, { options: hidden }))].join("\n\n"))
      .toMatchInlineSnapshot(`
        "$: array  (1) [ 1 ]
          0: number  1
          length: number  1
          meta: string (hidden)  "info"

        $: array  (1) [ 1 ]
          0: number  1
          length: number  1"
      `)
  })

  test("functions show their metadata, and their source as a hidden property", () => {
    function add(a: number, b: number) {
      return a + b
    }
    const tree = jsonToTree(add)
    expect(tree.children?.map((child) => `${keyPathToKey(child.keyPath)}${child.isNonEnumerable ? " (hidden)" : ""}`))
      .toMatchInlineSnapshot(`
        [
          "name",
          "length",
          "constructor",
          "[[Function]] (hidden)",
        ]
      `)
    expect(jsonToTree(add, { options: hidden }).children?.map((child) => keyPathToKey(child.keyPath)))
      .toMatchInlineSnapshot(`
        [
          "name",
          "length",
          "constructor",
        ]
      `)
  })

  test("errors show their name, message, stack and own properties", () => {
    const error = Object.assign(new Error("boom"), { code: 42 })
    expect(jsonToTree(error).children?.map((child) => keyPathToKey(child.keyPath))).toMatchInlineSnapshot(`
      [
        "name",
        "message",
        "stack",
        "code",
      ]
    `)
  })

  test("typed arrays show their layout and a sample of values", () => {
    expect(printTree(jsonToTree(new Int16Array([1, 2, 3])), 1)).toMatchInlineSnapshot(`
      "$: int16array  Int16Array(3) [ 1, 2, 3 ]
        length: number  3
        byteLength: number  6
        byteOffset: number  0
        buffer: arraybuffer  ArrayBuffer(6)
        [[Values]]: array (hidden)  (3) [ 1, 2, 3 ]"
    `)
  })

  test("circular references and the depth limit", () => {
    const value: any = { name: "loop" }
    value.self = value
    expect(printTree(jsonToTree(value))).toMatchInlineSnapshot(`
      "$: object  { name: "loop", self: [Circular] }
        name: string  "loop"
        self: circular  [Circular]"
    `)
    expect(printTree(jsonToTree("deep", { depth: 21 }))).toMatchInlineSnapshot(`"$: string  "[Max Depth Reached]""`)
  })
})

describe("preview options", () => {
  test("maxPreviewItems limits object, array and collection previews", () => {
    const options = { maxPreviewItems: 1 }
    const preview = (value: unknown) => elementText(jsonNodeToElement(jsonToTree(value), options))
    expect([
      preview({ a: 1, b: 2 }),
      preview([1, 2]),
      preview(new Set([1, 2])),
      preview(
        new Map([
          [1, 2],
          [3, 4],
        ]),
      ),
    ]).toMatchInlineSnapshot(`
        [
          "{ a: 1, … }",
          "(2) [ 1, … ]",
          "Set(2) { 1, … }",
          "Map(2) { 1 => 2, … }",
        ]
      `)
  })

  test("collapseStringsAfterLength shortens a string's description", () => {
    const node = jsonToTree("a long piece of text")
    expect(getNodeTypeDescription(node, { collapseStringsAfterLength: 6 })).toMatchInlineSnapshot(`""a long…""`)
  })
})

describe("accessible labels", () => {
  test("hidden properties say how they can be changed", () => {
    const value = {}
    Object.defineProperty(value, "fixed", { value: 1 })
    Object.defineProperty(value, "writable", { value: 2, writable: true, configurable: true })
    const tree = jsonToTree(value)
    expect(tree.children?.map((child) => getAccessibleDescription(child))).toMatchInlineSnapshot(`
      [
        "[[fixed]]: non-enumerable 1, read-only, non-configurable",
        "[[writable]]: non-enumerable 2",
      ]
    `)
  })

  test("hidden objects say non-enumerable once", () => {
    const value = Object.defineProperty({}, "config", { value: { a: 1 } })
    expect(getAccessibleDescription(jsonToTree(value).children![0])).toMatchInlineSnapshot(
      `"[[config]]: non-enumerable Object, expandable with 1 property"`,
    )
  })

  test("collection entries, stacks and circular references", () => {
    const value: any = { list: new Set([1, 2]) }
    value.self = value
    const tree = jsonToTree(value)
    const [list, self] = tree.children!
    expect([getAccessibleDescription(list.children![0]), getAccessibleDescription(self)]).toMatchInlineSnapshot(`
      [
        "[[Entries]]: non-enumerable 2 properties",
        "self: circular reference",
      ]
    `)
  })
})

describe("error stacks", () => {
  test("a stack renders as one line per frame", () => {
    const node = {
      value: "Error: boom\n    at a (a.js:1:1)\n    at b (b.js:2:2)",
      type: "string" as const,
      keyPath: ["$", "stack"],
    }
    expect(elementText(jsonNodeToElement(node))).toMatchInlineSnapshot(
      `"Error: boom\\n +    at a (a.js:1:1)\\n +    at b (b.js:2:2)"`,
    )
    expect(getAccessibleDescription(node)).toMatchInlineSnapshot(`"stack: at a (a.js:1:1)"`)
  })
})

describe("key paths", () => {
  test("ids, keys and stable values", () => {
    const root = getRootNode({ a: { b: 1 } })
    const b = root.children![0].children![0].children![0]
    expect({
      id: keyPathToId(b.keyPath),
      key: keyPathToKey(b.keyPath),
      label: nodeToString(b),
      rootLabel: nodeToString(root),
      isRoot: isRootKeyPath(root.children![0].keyPath),
      value: nodeToValue(b),
      matchesPath: nodeToValue(b) === jsonPathToValue("$.a.b"),
    }).toMatchInlineSnapshot(`
      {
        "id": "$.a.b",
        "isRoot": true,
        "key": "b",
        "label": "b",
        "matchesPath": true,
        "rootLabel": "root",
        "value": "$.a.b",
      }
    `)
  })
})
