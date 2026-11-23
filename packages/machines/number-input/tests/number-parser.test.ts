import { NumberParser } from "@internationalized/number"
import { describe, expect, test } from "vitest"
import { createNumberParser } from "../src/number-parser"

// The parser replaced `@internationalized/number`. These compare both on what Intl formats and what people type.
const locales = [
  "en-US",
  "de-DE",
  "fr-FR",
  "de-CH",
  "ar-EG",
  "ar-AE",
  "fa-IR",
  "hi-IN-u-nu-deva",
  "ja-JP",
  "es-ES",
  "ru-RU",
  "he-IL",
  "bn-BD",
  "zh-CN",
]
const optionSets: Intl.NumberFormatOptions[] = [
  {},
  { useGrouping: false },
  { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  { style: "percent" },
  { style: "percent", maximumFractionDigits: 2 },
  { style: "currency", currency: "USD" },
  { style: "currency", currency: "EUR", currencySign: "accounting" },
  { style: "currency", currency: "JPY" },
  { style: "unit", unit: "kilometer" },
  { style: "unit", unit: "day", unitDisplay: "long" },
  { signDisplay: "always" },
]
const values = [0, 1, -1, 12, -1234.5, 1234567.891, 0.5, -0.07, 0.123, 99.99, 1e6, 0.0001]

describe("number parser / matches the library it replaced", () => {
  test("on values Intl formats", () => {
    const mismatches: string[] = []
    for (const locale of locales)
      for (const options of optionSets) {
        const ours = createNumberParser(locale, options)
        const theirs = new NumberParser(locale, options)
        const fmt = new Intl.NumberFormat(locale, options)
        for (const value of values) {
          const text = fmt.format(value)
          const a = ours.parse(text)
          const b = theirs.parse(text)
          if (!Object.is(a, b))
            mismatches.push(`${locale} ${JSON.stringify(options)} ${JSON.stringify(text)}: ${a} vs ${b}`)
          for (let i = 1; i <= text.length; i++) {
            const prefix = text.slice(0, i)
            const pa = ours.isValidPartialNumber(prefix, -1e9, 1e9)
            const pb = theirs.isValidPartialNumber(prefix, -1e9, 1e9)
            if (pa !== pb)
              mismatches.push(`partial ${locale} ${JSON.stringify(options)} ${JSON.stringify(prefix)}: ${pa} vs ${pb}`)
          }
        }
      }
    expect(mismatches.slice(0, 20)).toEqual([])
  })

  test("on text people type", () => {
    const typed = [
      "1.",
      "1,",
      "1'234.5",
      "1’234.5",
      "1 234,5",
      "١٢٣",
      "١٢٣٫٥",
      "１２３",
      "12abc",
      "--1",
      "1.2.3",
      "(12)",
      "५४",
    ]
    const mismatches: string[] = []
    for (const locale of locales)
      for (const options of optionSets) {
        const ours = createNumberParser(locale, options)
        const theirs = new NumberParser(locale, options)
        for (const text of typed) {
          const a = ours.parse(text)
          const b = theirs.parse(text)
          if (!Object.is(a, b))
            mismatches.push(`${locale} ${JSON.stringify(options)} ${JSON.stringify(text)}: ${a} vs ${b}`)
          for (const [min, max] of [
            [-10, 10],
            [0, 10],
            [-10, 0],
          ]) {
            const pa = ours.isValidPartialNumber(text, min, max)
            const pb = theirs.isValidPartialNumber(text, min, max)
            if (pa !== pb)
              mismatches.push(
                `partial[${min},${max}] ${locale} ${JSON.stringify(options)} ${JSON.stringify(text)}: ${pa} vs ${pb}`,
              )
          }
        }
      }
    expect(mismatches.slice(0, 20)).toEqual([])
  })
})

describe("number parser / improvements over the library it replaced", () => {
  test("reads Persian digits in any locale", () => {
    expect(createNumberParser("en-US").parse("۱۲۳")).toBe(123)
    expect(createNumberParser("en-US").isValidPartialNumber("۱۲")).toBe(true)
  })

  test("an empty or sign-only percent is no value, as in every other style", () => {
    const percent = createNumberParser("en-US", { style: "percent" })
    expect(percent.parse("")).toBeNaN()
    expect(percent.parse("-")).toBeNaN()
    expect(percent.parse("1.2.3")).toBeNaN()
  })

  test("a percent without a whole part keeps its value", () => {
    expect(createNumberParser("en-US", { style: "percent", maximumFractionDigits: 2 }).parse(".5")).toBe(0.005)
  })
})
