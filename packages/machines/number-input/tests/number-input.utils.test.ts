import { describe, expect, test } from "vitest"
import { createFormatter, createParser, formatNumber, formatValue, parseValue } from "../src/number-input.utils"

const setup = (locale: string, formatOptions?: Intl.NumberFormatOptions) => {
  const formatter = createFormatter(locale, formatOptions)
  const parser = createParser(locale, formatOptions)
  const props: Record<string, any> = { locale, formatOptions }
  const computed: Record<string, any> = { formatter, parser }
  return { prop: (key: string) => props[key], computed: (key: string) => computed[key] } as any
}

describe("without formatOptions", () => {
  test("reads the locale's decimal separator", () => {
    expect(parseValue("1,5", setup("de-DE"))).toBe(1.5)
  })

  test("shows the locale's decimal separator", () => {
    expect(formatValue(1.5, setup("de-DE"))).toBe("1,5")
  })

  test("keeps every decimal of the value", () => {
    const params = setup("en-US")
    expect(formatValue(123.456789012345, params)).toBe("123.456789012345")
    expect(parseValue("123.456789012345", params)).toBe(123.456789012345)
  })

  test("doesn't add group separators", () => {
    expect(formatValue(1234567.5, setup("de-DE"))).toBe("1234567,5")
  })

  test("is empty for an empty value", () => {
    expect(Number.isNaN(parseValue("", setup("de-DE")))).toBe(true)
    expect(formatValue(null, setup("de-DE"))).toBe("")
  })
})

describe("createFormatter / step decimals", () => {
  const show = (value: number, options: Intl.NumberFormatOptions, step: number) =>
    formatNumber(value, createFormatter("en-US", options, step), options)

  test("shows the step's decimals past Intl's default of three", () => {
    expect(show(0.0001, { useGrouping: true }, 0.0001)).toBe("0.0001")
    expect(show(0.0001, { style: "percent" }, 0.0001)).toBe("0.01%")
  })

  test("never shows fewer decimals than Intl would", () => {
    expect(show(1.5, { style: "currency", currency: "USD" }, 1)).toBe("$1.50")
    expect(show(1234, { style: "currency", currency: "JPY" }, 1)).toBe("¥1,234")
  })

  test("keeps a maximum of your own", () => {
    expect(show(1.23456, { maximumFractionDigits: 1 }, 0.0001)).toBe("1.2")
  })
})
