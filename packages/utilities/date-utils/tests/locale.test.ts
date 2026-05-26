import { describe, expect, test } from "vitest"
import { ensureValidCharacters, getLocaleSeparator, isValidCharacter } from "../src"

describe("isValidCharacter", () => {
  test("accepts digits", () => {
    expect(isValidCharacter("5", "/")).toBe(true)
    expect(isValidCharacter("0", ". ")).toBe(true)
  })

  test("accepts single-char separator", () => {
    expect(isValidCharacter("/", "/")).toBe(true)
    expect(isValidCharacter(".", ".")).toBe(true)
    expect(isValidCharacter("-", "-")).toBe(true)
  })

  test("rejects non-digit, non-separator characters", () => {
    expect(isValidCharacter("a", "/")).toBe(false)
    expect(isValidCharacter("!", "/")).toBe(false)
  })

  test("accepts each character of a multi-char separator (cs-CZ regression)", () => {
    expect(isValidCharacter(".", ". ")).toBe(true)
    expect(isValidCharacter(" ", ". ")).toBe(true)
  })

  test("rejects letters even with multi-char separator", () => {
    expect(isValidCharacter("a", ". ")).toBe(false)
  })

  test("accepts null or empty char", () => {
    expect(isValidCharacter(null, "/")).toBe(true)
    expect(isValidCharacter("", "/")).toBe(true)
  })

  test("accepts multi-char data (paste/IME passthrough)", () => {
    expect(isValidCharacter("20.10.2000", ". ")).toBe(true)
  })
})

describe("ensureValidCharacters", () => {
  test("preserves full cs-CZ format with spaces (regression)", () => {
    expect(ensureValidCharacters("20. 10. 2000", ". ")).toBe("20. 10. 2000")
  })

  test("preserves cs-CZ short form without spaces (regression)", () => {
    expect(ensureValidCharacters("20.10.2000", ". ")).toBe("20.10.2000")
  })

  test("strips letters but keeps digits and separator chars", () => {
    expect(ensureValidCharacters("abc20.10", ". ")).toBe("20.10")
  })

  test("preserves valid en-US format", () => {
    expect(ensureValidCharacters("01/02/2024", "/")).toBe("01/02/2024")
  })

  test("strips dots when separator is slash", () => {
    expect(ensureValidCharacters("20.10.2000", "/")).toBe("20102000")
  })
})

describe("getLocaleSeparator", () => {
  test("returns / for en-US", () => {
    expect(getLocaleSeparator("en-US")).toBe("/")
  })

  test("returns dot-space for cs-CZ", () => {
    expect(getLocaleSeparator("cs-CZ")).toBe(". ")
  })

  test("returns dot for de-AT", () => {
    expect(getLocaleSeparator("de-AT")).toBe(".")
  })
})
