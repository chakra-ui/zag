import { describe, expect, test } from "vitest"
import { defaultTranslations, hashTranslations } from "../src/utils/placeholders"

describe("@zag-js/date-input placeholders", () => {
  test("uses language-script placeholders before falling back to language", () => {
    expect(defaultTranslations.placeholder("sr-Latn-RS")).toMatchObject({
      day: "dd",
      month: "mm",
      year: "gggg",
    })
  })

  test("falls back to language placeholders without a matching script", () => {
    expect(defaultTranslations.placeholder("sr-RS")).toMatchObject({
      day: "дд",
      month: "мм",
      year: "гггг",
    })
  })
})

describe("@zag-js/date-input hashTranslations", () => {
  test("returns a stable hash for distinct objects with the same placeholders", () => {
    const a = { placeholder: () => ({ day: "dd", month: "mm" }) as any }
    const b = { placeholder: () => ({ day: "dd", month: "mm" }) as any }
    expect(a).not.toBe(b)
    expect(hashTranslations(a, "en-US")).toBe(hashTranslations(b, "en-US"))
  })

  test("changes when the resolved placeholders change", () => {
    const a = { placeholder: () => ({ day: "dd" }) as any }
    const b = { placeholder: () => ({ day: "DD" }) as any }
    expect(hashTranslations(a, "en-US")).not.toBe(hashTranslations(b, "en-US"))
  })

  test("is independent of key order", () => {
    const a = { placeholder: () => ({ day: "dd", month: "mm" }) as any }
    const b = { placeholder: () => ({ month: "mm", day: "dd" }) as any }
    expect(hashTranslations(a, "en-US")).toBe(hashTranslations(b, "en-US"))
  })

  test("varies by locale", () => {
    expect(hashTranslations(defaultTranslations, "en-US")).not.toBe(hashTranslations(defaultTranslations, "de-DE"))
  })

  test("does not collide when a placeholder contains the separators", () => {
    const a = { placeholder: () => ({ day: "x", month: "y" }) as any }
    const b = { placeholder: () => ({ day: "x,month:y" }) as any }
    expect(hashTranslations(a, "en-US")).not.toBe(hashTranslations(b, "en-US"))
  })

  test("returns an empty hash when there is nothing to resolve", () => {
    expect(hashTranslations(undefined, "en-US")).toBe("")
    expect(hashTranslations({}, "en-US")).toBe("")
  })
})
