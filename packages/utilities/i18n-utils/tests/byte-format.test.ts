import { formatBytes, type FormatBytesOptions } from "../src"

describe("formatBytes", () => {
  test("should return empty string for NaN", () => {
    const result = formatBytes(NaN)
    expect(result).toMatchInlineSnapshot(`""`)
  })

  test("should return '0 B' for 0 bytes", () => {
    const result = formatBytes(0)
    expect(result).toMatchInlineSnapshot(`"0 B"`)
  })

  test("should format bytes correctly", () => {
    const options: FormatBytesOptions = { unit: "byte", unitDisplay: "short" }
    const result = formatBytes(1500, "en-US", options)
    expect(result).toMatchInlineSnapshot(`"1.5 kB"`)
  })

  test("should format bits correctly", () => {
    const options: FormatBytesOptions = { unit: "bit", unitDisplay: "short" }
    const result = formatBytes(1500, "en-US", options)
    expect(result).toMatchInlineSnapshot(`"1.5 kb"`)
  })

  test("should handle large byte values", () => {
    const options: FormatBytesOptions = { unit: "byte", unitDisplay: "short" }
    const result = formatBytes(1500000000, "en-US", options)
    expect(result).toMatchInlineSnapshot(`"1.5 GB"`)
  })
})
