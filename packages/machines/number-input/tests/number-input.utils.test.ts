import { describe, expect, test } from "vitest"
import { createFormatter, createParser, formatValue, parseValue, snapToStep } from "../src/number-input.utils"

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

describe("snapToStep", () => {
  test("rounds toward where the step came from", () => {
    expect(snapToStep(6.5, 0, 1, 1)).toBe(6)
    expect(snapToStep(4.5, 0, 1, -1)).toBe(5)
  })

  test("keeps a value already on the grid despite float noise", () => {
    expect(snapToStep(0.1 + 0.2, 0, 0.1, 1)).toBe(0.3)
    expect(snapToStep(0.7 - 0.1, 0, 0.1, -1)).toBe(0.6)
  })

  test("measures the grid from the base", () => {
    expect(snapToStep(2, 0.5, 1, 1)).toBe(1.5)
  })
})
