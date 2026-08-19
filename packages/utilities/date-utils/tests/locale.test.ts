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

  describe("locale-aware numerals", () => {
    test("accepts ASCII digits in any locale", () => {
      expect(isValidCharacter("5", "/", "en-US")).toBe(true)
      expect(isValidCharacter("5", "/", "ar-EG")).toBe(true)
      expect(isValidCharacter("5", "/", "hi-IN-u-nu-deva")).toBe(true)
    })

    test("accepts Arabic-Indic numerals in ar locale", () => {
      expect(isValidCharacter("٥", "/", "ar-EG")).toBe(true) // U+0665
      expect(isValidCharacter("٠", "/", "ar-EG")).toBe(true) // U+0660
    })

    test("accepts Devanagari numerals in hi deva locale", () => {
      expect(isValidCharacter("५", "/", "hi-IN-u-nu-deva")).toBe(true) // U+096B
      expect(isValidCharacter("०", "/", "hi-IN-u-nu-deva")).toBe(true) // U+0966
    })

    test("accepts Bengali numerals in bn beng locale", () => {
      expect(isValidCharacter("৫", "/", "bn-IN-u-nu-beng")).toBe(true) // U+09EB
    })

    test("rejects non-locale numerals when locale is provided", () => {
      expect(isValidCharacter("५", "/", "en-US")).toBe(false) // Devanagari in en-US
      expect(isValidCharacter("٥", "/", "hi-IN-u-nu-deva")).toBe(false) // Arabic-Indic in Devanagari
    })

    test("still rejects letters and symbols when locale is provided", () => {
      expect(isValidCharacter("a", "/", "ar-EG")).toBe(false)
      expect(isValidCharacter("!", "/", "hi-IN-u-nu-deva")).toBe(false)
    })

    test("falls back to ASCII-only when no locale is given", () => {
      expect(isValidCharacter("5", "/")).toBe(true)
      expect(isValidCharacter("٥", "/")).toBe(false)
    })
  })
})

describe("ensureValidCharacters (locale-aware)", () => {
  test("preserves Arabic-Indic numerals in ar locale", () => {
    expect(ensureValidCharacters("٢٠/١٠/٢٠٠٠", "/", "ar-EG")).toBe("٢٠/١٠/٢٠٠٠")
  })

  test("strips foreign numerals not in the locale's numbering system", () => {
    expect(ensureValidCharacters("0५1", "/", "en-US")).toBe("01") // Devanagari stripped, ASCII kept
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
