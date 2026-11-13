import { describe, expect, test } from "vitest"
import { jsonNodeToElement, jsonToTree, type JsonNode } from "../src"
import { elementText } from "./test-utils"

const setPreview = (maxPreviewItems: number) => {
  const node: JsonNode = { value: new Set([0, 1, 2, 3]), type: "set", keyPath: ["$"] }

  return elementText(jsonNodeToElement(node, { maxPreviewItems }))
}

describe("bounded collection previews", () => {
  test("reads only the requested Set preview entries", () => {
    const value = new Set(Array.from({ length: 1000 }, (_, index) => index))
    const iterator = value[Symbol.iterator].bind(value)
    const node: JsonNode = { value, type: "set", keyPath: ["$"] }
    let reads = 0

    value[Symbol.iterator] = function* () {
      for (const entry of iterator()) {
        reads++
        yield entry
      }

      return undefined
    }

    const preview = elementText(jsonNodeToElement(node))

    expect(preview).toContain("0, 1, 2, …")
    expect(reads).toBe(3)

    jsonNodeToElement(node, { maxPreviewItems: 0 })

    expect(reads).toBe(3)
  })

  test("reads only the requested Map preview entries", () => {
    const value = new Map(Array.from({ length: 1000 }, (_, index) => [index, index]))
    const iterator = value.entries.bind(value)
    const node: JsonNode = { value, type: "map", keyPath: ["$"] }
    let reads = 0

    value.entries = function* () {
      for (const entry of iterator()) {
        reads++
        yield entry
      }

      return undefined
    }

    const preview = elementText(jsonNodeToElement(node))

    expect(preview).toContain("0 => 0, 1 => 1, 2 => 2, …")
    expect(reads).toBe(3)

    jsonNodeToElement(node, { maxPreviewItems: 0 })

    expect(reads).toBe(3)
  })

  test("shows an ellipsis when the preview is truncated", () => {
    expect(setPreview(3)).toBe("Set(4) { 0, 1, 2, … }")
  })

  test("omits the ellipsis when the limit covers the collection", () => {
    expect(setPreview(10)).toBe("Set(4) { 0, 1, 2, 3 }")
  })

  test("preserves previews for generic iterables", () => {
    const value = {
      *[Symbol.iterator]() {
        yield 1
        yield 2
        yield 3
        yield 4
      },
    }

    const node = jsonToTree(value)
    const preview = elementText(jsonNodeToElement(node))

    expect(preview).toBe("Iterable(4) { 1, 2, 3, … }")
  })

  test("samples typed arrays without iterating the full input", () => {
    const value = new Uint32Array(10000)

    value.set([1, 2, 3, 4, 5, 6])
    Object.defineProperty(value, Symbol.iterator, {
      value() {
        throw new Error("Full array iteration")
      },
    })

    const node = jsonToTree(value)
    const valuesNode = node.children?.find((child) => child.keyPath.at(-1) === "[[Values]]")

    expect(valuesNode?.value).toHaveLength(100)
    expect(elementText(jsonNodeToElement(node))).toContain("1, 2, 3, 4, 5, …")
  })

  test("materializes Map entries once and preserves object keys and values", () => {
    const key = { id: 1 }
    const value = new Map([[key, { a: 2 }]])
    const iterator = value.entries.bind(value)
    let reads = 0

    value.entries = function* () {
      reads++
      yield* iterator()

      return undefined
    }

    const node = jsonToTree(value)
    const entries = node.children![0]

    expect(reads).toBe(1)
    expect(entries.value).toEqual([[key, { a: 2 }]])
    expect(entries.children![0].children?.map((child) => child.value)).toEqual([key, { a: 2 }])
  })
})
