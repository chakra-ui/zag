import { describe, expect, test } from "vitest"
import { defaultTranslations } from "../src/utils/placeholders"

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
