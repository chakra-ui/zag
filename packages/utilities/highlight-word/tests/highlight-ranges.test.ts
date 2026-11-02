import { describe, expect, test } from "vitest"
import { highlightRanges } from "../src"

const marked = (text: string, ranges: { start: number; end: number }[]) =>
  highlightRanges({ text, ranges })
    .map((chunk) => (chunk.match ? `[${chunk.text}]` : chunk.text))
    .join("")

describe("highlightRanges", () => {
  test("no ranges", () => {
    expect(highlightRanges({ text: "Open file", ranges: [] })).toEqual([{ text: "Open file", match: false }])
  })

  test("splits the text at the ranges", () => {
    expect(
      marked("Open file", [
        { start: 0, end: 1 },
        { start: 5, end: 9 },
      ]),
    ).toBe("[O]pen [file]")
  })

  test("sorts and merges overlapping ranges", () => {
    expect(
      marked("abcdef", [
        { start: 3, end: 5 },
        { start: 0, end: 2 },
        { start: 1, end: 4 },
      ]),
    ).toBe("[abcde]f")
  })

  test("clamps ranges to the text and drops empty ones", () => {
    expect(
      marked("abc", [
        { start: -2, end: 1 },
        { start: 2, end: 10 },
        { start: 1, end: 1 },
      ]),
    ).toBe("[a]b[c]")
  })
})
