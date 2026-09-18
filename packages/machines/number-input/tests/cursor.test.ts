import { describe, expect, test } from "vitest"
import { getNextCursorPosition } from "../src/cursor"

describe("getNextCursorPosition", () => {
  describe("value unchanged", () => {
    test("cursor at start", () => {
      // "|hello" -> "|hello"
      expect(getNextCursorPosition("hello", "hello", 0)).toBe(0)
    })

    test("cursor in middle", () => {
      // "he|llo" -> "he|llo"
      expect(getNextCursorPosition("hello", "hello", 2)).toBe(2)
    })

    test("cursor at end", () => {
      // "hello|" -> "hello|"
      expect(getNextCursorPosition("hello", "hello", 5)).toBe(5)
    })
  })

  describe("cursor at start, value completely changed", () => {
    test("moves cursor to end", () => {
      // "|100" -> "999|" - no prefix/suffix match, cursor moves to end
      expect(getNextCursorPosition("100", "999", 0)).toBe(3)
    })

    test("different lengths - moves to end", () => {
      // "|abc" -> "xyz123|" - no prefix/suffix match, cursor moves to end
      expect(getNextCursorPosition("abc", "xyz123", 0)).toBe(6)
    })

    test("empty old value", () => {
      // "|" -> "hello|" - empty to non-empty, cursor at end
      expect(getNextCursorPosition("", "hello", 0)).toBe(5)
    })
  })

  describe("typing at end (prefix preserved)", () => {
    test("appending characters - cursor stays at prefix end", () => {
      // "123|" -> "123|4" - prefix "123" fully matches, cursor stays at prefix end
      expect(getNextCursorPosition("123", "1234", 3)).toBe(3)
    })

    test("appending multiple characters - cursor stays at prefix end", () => {
      // "abc|" -> "abc|def" - prefix fully matches
      expect(getNextCursorPosition("abc", "abcdef", 3)).toBe(3)
    })
  })

  describe("typing at start (suffix preserved)", () => {
    test("prepending characters", () => {
      // "|123" -> "0|123" (cursor was at 0, suffix "123" preserved)
      expect(getNextCursorPosition("123", "0123", 0)).toBe(1)
    })

    test("prepending multiple characters", () => {
      // "|abc" -> "xyz|abc"
      expect(getNextCursorPosition("abc", "xyzabc", 0)).toBe(3)
    })
  })

  describe("typing in middle", () => {
    test("inserting character - prefix preserved", () => {
      // "12|34" -> "12|X34" - prefix "12" matches, cursor stays after prefix
      expect(getNextCursorPosition("1234", "12X34", 2)).toBe(2)
    })

    test("cursor after prefix, suffix preserved", () => {
      // "ab|cd" -> "ab|XXcd" - prefix "ab" matches, suffix "cd" matches
      expect(getNextCursorPosition("abcd", "abXXcd", 2)).toBe(2)
    })
  })

  describe("formatting scenarios", () => {
    test("number gets comma formatting - cursor at end", () => {
      // "1000|" -> "1,000|" (cursor at end, suffix empty, prefix matches to comma)
      expect(getNextCursorPosition("1000", "1,000", 4)).toBe(5)
    })

    test("cursor in middle during formatting", () => {
      // "10|00" -> "1,0|00" - prefix "10" doesn't fully match "1,", uses suffix "00"
      expect(getNextCursorPosition("1000", "1,000", 2)).toBe(3)
    })

    test("currency formatting - prefix matches then suffix", () => {
      // "555|" -> "$555.00" - no prefix match, suffix empty, moves to end
      expect(getNextCursorPosition("555", "$555.00", 3)).toBe(7)
    })
  })

  describe("deleting characters", () => {
    test("backspace at end", () => {
      // "1234|" -> "123|" - cursor was past old value, clamps to new end
      expect(getNextCursorPosition("1234", "123", 4)).toBe(3)
    })

    test("delete in middle", () => {
      // "12|34" -> "12|4" (deleted 3, prefix preserved)
      expect(getNextCursorPosition("1234", "124", 2)).toBe(2)
    })
  })

  describe("edge cases", () => {
    test("empty new value", () => {
      // "he|llo" -> "|" - value cleared, cursor at start
      expect(getNextCursorPosition("hello", "", 2)).toBe(0)
    })

    test("both empty", () => {
      // "|" -> "|" - both empty, cursor stays at 0
      expect(getNextCursorPosition("", "", 0)).toBe(0)
    })

    test("partial prefix match only", () => {
      // "abc|def" -> "ab|X" - prefix "abc" partially matches "ab"
      expect(getNextCursorPosition("abcdef", "abX", 3)).toBe(2)
    })

    test("partial suffix match only", () => {
      // "|abcdef" -> "X|def" - suffix "abcdef" partially matches "def"
      expect(getNextCursorPosition("abcdef", "Xdef", 0)).toBe(1)
    })

    test("relative position fallback", () => {
      // "ab|cd" -> "XXXX|XXXX" - no match, uses 50% ratio (2/4 = 4/8)
      expect(getNextCursorPosition("abcd", "XXXXXXXX", 2)).toBe(4)
    })
  })
})
