import { describe, expect, test } from "vitest"
import type { InlineRectCoords, RectLike } from "../src/inline"
import { findLineIndex, getInlineReferenceRect, getLineRects } from "../src/inline"

const rect = (left: number, top: number, right: number, bottom: number): RectLike => ({
  x: left,
  y: top,
  left,
  top,
  right,
  bottom,
  width: right - left,
  height: bottom - top,
})

// A link wrapping across three lines of a 400px column.
const LINE_1 = rect(200, 0, 400, 20)
const LINE_2 = rect(0, 20, 400, 40)
const LINE_3 = rect(0, 40, 120, 60)
const THREE_LINES = [LINE_1, LINE_2, LINE_3]

const reference = (rects: RectLike[]) => ({ getClientRects: () => rects })

const coords = (x: number, y: number, lineIndex?: number): InlineRectCoords =>
  ({ x, y, lineIndex, element: {} as Element }) as InlineRectCoords

describe("getLineRects", () => {
  test("a single rect is one line", () => {
    const { lines, fallback } = getLineRects([rect(10, 10, 90, 30)])
    expect(lines).toHaveLength(1)
    expect(fallback).toMatchObject({ left: 10, top: 10, right: 90, bottom: 30 })
  })

  test("groups rects into one line per visual line", () => {
    const { lines } = getLineRects(THREE_LINES)
    expect(lines).toHaveLength(3)
    expect(lines[0]).toMatchObject({ left: 200, top: 0, right: 400, bottom: 20 })
    expect(lines[2]).toMatchObject({ left: 0, top: 40, right: 120, bottom: 60 })
  })

  test("merges fragments of the same line", () => {
    // Two rects on one line, e.g. a link containing a <strong>.
    const { lines } = getLineRects([rect(0, 0, 50, 20), rect(50, 0, 130, 20)])
    expect(lines).toHaveLength(1)
    expect(lines[0]).toMatchObject({ left: 0, right: 130 })
  })

  test("splits only once the top clears half the previous height", () => {
    // 9px of a 20px line is sub-pixel drift, not a new line.
    expect(getLineRects([rect(0, 0, 100, 20), rect(0, 9, 100, 29)]).lines).toHaveLength(1)
    expect(getLineRects([rect(0, 0, 100, 20), rect(0, 11, 100, 31)]).lines).toHaveLength(2)
  })

  test("sorts unordered rects before grouping", () => {
    const { lines } = getLineRects([LINE_3, LINE_1, LINE_2])
    expect(lines.map((l) => l.top)).toEqual([0, 20, 40])
  })

  test("fallback spans every line", () => {
    const { fallback } = getLineRects(THREE_LINES)
    expect(fallback).toMatchObject({ left: 0, top: 0, right: 400, bottom: 60 })
  })
})

describe("findLineIndex", () => {
  const { lines } = getLineRects(THREE_LINES)

  test("finds the line under the point", () => {
    expect(findLineIndex(lines, 300, 10)).toBe(0)
    expect(findLineIndex(lines, 200, 30)).toBe(1)
    expect(findLineIndex(lines, 60, 50)).toBe(2)
  })

  test("tolerates a point up to 2px outside", () => {
    expect(findLineIndex(lines, 300, -1)).toBe(0)
    expect(findLineIndex(lines, 121, 50)).toBe(2)
  })

  test("the padding overlaps adjacent lines, and the upper one wins", () => {
    // y=41 is inside both padded rects; first match wins, so a boundary point resolves upward.
    expect(findLineIndex(lines, 60, 41)).toBe(1)
  })

  test("returns -1 when the point is clear of every line", () => {
    expect(findLineIndex(lines, 300, 50)).toBe(-1)
  })
})

describe("getInlineReferenceRect", () => {
  test("is a no-op for a reference on a single line", () => {
    expect(
      getInlineReferenceRect({ reference: reference([rect(10, 10, 90, 30)]), placement: "bottom", coords: undefined }),
    ).toBeNull()
  })

  test("anchors to the captured line", () => {
    const got = getInlineReferenceRect({
      reference: reference(THREE_LINES),
      placement: "bottom",
      coords: coords(200, 30, 1),
    })
    expect(got).toMatchObject({ left: 0, top: 20, right: 400, bottom: 40 })
  })

  test("a captured line survives the pointer moving away", () => {
    // Reused rather than re-tested, so a reflow cannot move it.
    const got = getInlineReferenceRect({
      reference: reference(THREE_LINES),
      placement: "bottom",
      coords: coords(9999, 9999, 2),
    })
    expect(got).toMatchObject({ top: 40, bottom: 60 })
  })

  test("falls back to hit testing when the captured index is stale", () => {
    const got = getInlineReferenceRect({
      reference: reference(THREE_LINES),
      placement: "bottom",
      coords: coords(300, 10, 7),
    })
    expect(got).toMatchObject({ top: 0, bottom: 20 })
  })

  test("spans both lines when two disjoint lines miss the pointer", () => {
    const disjoint = [rect(300, 0, 400, 20), rect(0, 20, 100, 40)]
    const got = getInlineReferenceRect({ reference: reference(disjoint), placement: "bottom", coords: coords(200, 30) })
    expect(got).toMatchObject({ left: 0, top: 0, right: 400, bottom: 40 })
  })

  test("without coords, top takes the first line and bottom the last", () => {
    expect(
      getInlineReferenceRect({ reference: reference(THREE_LINES), placement: "top", coords: undefined }),
    ).toMatchObject({
      left: 200,
      right: 400,
    })
    expect(
      getInlineReferenceRect({ reference: reference(THREE_LINES), placement: "bottom", coords: undefined }),
    ).toMatchObject({
      left: 0,
      right: 120,
    })
  })

  test("without coords, side placements take the line reaching furthest that way", () => {
    // Ties on the edge span every line reaching it: 2 and 3 at left 0, 1 and 2 at right 400.
    expect(
      getInlineReferenceRect({ reference: reference(THREE_LINES), placement: "left", coords: undefined }),
    ).toMatchObject({
      top: 20,
      bottom: 60,
    })
    expect(
      getInlineReferenceRect({ reference: reference(THREE_LINES), placement: "right", coords: undefined }),
    ).toMatchObject({
      top: 0,
      bottom: 40,
    })
  })

  test("side placements measure width across every line", () => {
    expect(
      getInlineReferenceRect({ reference: reference(THREE_LINES), placement: "left", coords: undefined }),
    ).toMatchObject({
      left: 0,
      right: 400,
    })
  })
})
