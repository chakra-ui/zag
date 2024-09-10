import { describe, expect, test } from "vitest"
import { highlightWord } from "../src"

describe("highlightWord / First Occurrence", () => {
  test("works", () => {
    const result = highlightWord({ text: "Hello world", query: "world" })
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "match": false,
          "text": "Hello ",
        },
        {
          "match": true,
          "text": "world",
        },
      ]
    `)
  })

  test("case sensitivity", () => {
    const result = highlightWord({ text: "Hello World", query: "world", ignoreCase: false })
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "match": false,
          "text": "Hello World",
        },
      ]
    `)
  })

  test("ignoring case", () => {
    const result = highlightWord({ text: "Hello World", query: "world", ignoreCase: true })
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "match": false,
          "text": "Hello ",
        },
        {
          "match": true,
          "text": "World",
        },
      ]
    `)
  })

  test("query is not found", () => {
    const result = highlightWord({ text: "Hello World", query: "foo" })
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "match": false,
          "text": "Hello World",
        },
      ]
    `)
  })

  test("empty query", () => {
    const result = highlightWord({ text: "Hello World", query: "" })
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "match": false,
          "text": "Hello World",
        },
      ]
    `)
  })

  test("query at the beginning", () => {
    const result = highlightWord({ text: "Hello World", query: "Hello" })
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "match": true,
          "text": "Hello",
        },
        {
          "match": false,
          "text": " World",
        },
      ]
    `)
  })

  test("query at the end", () => {
    const result = highlightWord({ text: "Hello World", query: "World" })
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "match": false,
          "text": "Hello ",
        },
        {
          "match": true,
          "text": "World",
        },
      ]
    `)
  })

  test("throw when query is array and matchAll is false", () => {
    expect(() => highlightWord({ text: "Hello world", query: ["rld", "llo"], matchAll: false })).toThrow()
  })
})

describe("highlightWord / Multiple Occurrences", () => {
  test("works", () => {
    const result = highlightWord({
      text: "The quick brown fox jumped over the lazy dog in the fog",
      query: "og",
      matchAll: true,
    })

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "match": false,
          "text": "The quick brown fox jumped over the lazy d",
        },
        {
          "match": true,
          "text": "og",
        },
        {
          "match": false,
          "text": " in the f",
        },
        {
          "match": true,
          "text": "og",
        },
      ]
    `)
  })

  test("array query", () => {
    const result = highlightWord({
      text: "The quick brown fox jumps over the lazy dog",
      query: ["quick", "lazy"],
    })

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "match": false,
          "text": "The ",
        },
        {
          "match": true,
          "text": "quick",
        },
        {
          "match": false,
          "text": " brown fox jumps over the ",
        },
        {
          "match": true,
          "text": "lazy",
        },
        {
          "match": false,
          "text": " dog",
        },
      ]
    `)
  })

  test("case sensitivity", () => {
    const result = highlightWord({
      text: "The QUICK brown fox",
      query: "quick",
      matchAll: true,
      ignoreCase: false,
    })

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "match": false,
          "text": "The QUICK brown fox",
        },
      ]
    `)

    const result2 = highlightWord({
      text: "The QUICK brown fox",
      query: "quick",
      matchAll: true,
      ignoreCase: true,
    })

    expect(result2).toMatchInlineSnapshot(`
      [
        {
          "match": false,
          "text": "The ",
        },
        {
          "match": true,
          "text": "QUICK",
        },
        {
          "match": false,
          "text": " brown fox",
        },
      ]
    `)
  })

  test("special characters in query", () => {
    const result = highlightWord({
      text: "The (quick) brown fox",
      query: "(quick)",
      matchAll: true,
    })

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "match": false,
          "text": "The ",
        },
        {
          "match": true,
          "text": "(quick)",
        },
        {
          "match": false,
          "text": " brown fox",
        },
      ]
    `)
  })

  test("empty query", () => {
    const result = highlightWord({ text: "The quick brown fox", query: "", matchAll: true })
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "match": false,
          "text": "The quick brown fox",
        },
      ]
    `)
  })

  test("query longer than text", () => {
    const result = highlightWord({ text: "fox", query: "quick brown fox", matchAll: true })
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "match": false,
          "text": "fox",
        },
      ]
    `)
  })

  test("applies to all matches", () => {
    const result = highlightWord({
      text: "match match match",
      query: "match",
      matchAll: true,
    })

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "match": true,
          "text": "match",
        },
        {
          "match": false,
          "text": " ",
        },
        {
          "match": true,
          "text": "match",
        },
        {
          "match": false,
          "text": " ",
        },
        {
          "match": true,
          "text": "match",
        },
      ]
    `)
  })

  test("does not parse regex characters", () => {
    const result = highlightWord({
      text: "match match match",
      query: "(.)+",
      matchAll: true,
    })

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "match": false,
          "text": "match match match",
        },
      ]
    `)
  })
})
