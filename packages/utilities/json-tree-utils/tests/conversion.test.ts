import { describe, expect, test } from "vitest"
import { dataTypes, getPreviewOptions, jsonNodeToElement, jsonToTree, type JsonNode } from "../src"
import { elementText } from "./test-utils"

const childKeys = (node: JsonNode) => node.children?.map((child) => child.keyPath.at(-1))

describe("JSON tree conversion", () => {
  test("preserves property order and hidden descriptors on small objects", () => {
    const value = { first: 1, second: 2 }

    Object.defineProperty(value, "secret", { value: 42, configurable: true })

    const node = jsonToTree(value)

    expect(childKeys(node)).toEqual(["first", "second", "[[secret]]"])
    expect(node.children?.at(-1)).toMatchObject({
      value: 42,
      isNonEnumerable: true,
      propertyDescriptor: { value: 42, writable: false, configurable: true, enumerable: false },
    })
  })

  test("preserves property order and hidden descriptors on wide objects", () => {
    const value = Object.fromEntries(Array.from({ length: 1000 }, (_, index) => [`key${index}`, index]))

    Object.defineProperty(value, "secret", { value: 42 })

    const node = jsonToTree(value)

    expect(childKeys(node)).toEqual([...Object.keys(value), "[[secret]]"])
    expect(node.children?.at(-1)).toMatchObject({
      value: 42,
      isNonEnumerable: true,
      propertyDescriptor: { value: 42, writable: false, configurable: false, enumerable: false },
    })
  })

  test("omits hidden properties when disabled", () => {
    const value = Object.defineProperty({ a: 1 }, "secret", { value: 42 })
    const options = getPreviewOptions({ showNonenumerable: false })

    const node = jsonToTree(value, { options })

    expect(childKeys(node)).toEqual(["a"])
  })

  test("skips hidden-key enumeration when hidden properties are disabled", () => {
    let enumerations = 0

    const value = new Proxy(
      { a: 1 },
      {
        ownKeys(target) {
          enumerations++
          return Reflect.ownKeys(target)
        },
      },
    )

    jsonToTree(value, { options: getPreviewOptions({ showNonenumerable: false }) })

    expect(enumerations).toBe(1)
  })

  test("preserves class names and hidden properties", () => {
    class Example {
      a = 1
    }

    const value = Object.defineProperty(new Example(), "secret", { value: 2 })

    const node = jsonToTree(value)

    expect(node).toMatchObject({
      constructorName: "Example",
      children: [
        { value: 1, keyPath: ["$", "a"] },
        { value: 2, keyPath: ["$", "[[secret]]"], isNonEnumerable: true },
      ],
    })
  })

  test("groups sparse arrays while preserving index paths", () => {
    const value: unknown[] = []
    const options = getPreviewOptions({ groupArraysAfterLength: 2 })

    value[3] = "a"
    value[100] = "b"
    value[1_000_000] = "c"
    Object.defineProperty(value, "secret", { value: 42 })

    const node = jsonToTree(value, { options })

    expect(childKeys(node)).toEqual(["[3…100]", "[1000000…1000000]", "length", "secret"])
    expect(node.children?.[0].children?.map((child) => child.keyPath)).toEqual([
      ["$", "3"],
      ["$", "100"],
    ])
    expect(node.children?.[2].value).toBe(1_000_001)
    expect(node.children?.at(-1)?.propertyDescriptor?.enumerable).toBe(false)
  })

  test("marks circular references", () => {
    const value: Record<string, unknown> = { n: 1 }

    value.self = value

    const node = jsonToTree(value)

    expect(node.children?.[1]).toMatchObject({ type: "circular", keyPath: ["$", "self"] })
  })

  test("limits conversion depth", () => {
    const node = jsonToTree({ a: 1 }, { depth: 21 })

    expect(node).toMatchObject({ value: "[Max Depth Reached]", type: "string" })
  })

  test("honors custom type registry entries in conversion and previews", () => {
    const custom = { ...dataTypes[0], check: (value: unknown) => typeof value === "number" }

    dataTypes.unshift(custom)

    try {
      const node = jsonToTree({ a: 123 }).children![0]

      expect(node.type).toBe("null")
      expect(elementText(jsonNodeToElement(node))).toBe("null")
    } finally {
      dataTypes.shift()
    }
  })

  test("honors changed built-in type checks", () => {
    const original = dataTypes[0].check

    dataTypes[0].check = (value) => value === 123 || original(value)

    try {
      expect(jsonToTree(123).type).toBe("null")
    } finally {
      dataTypes[0].check = original
    }
  })
})
