import { formatBytes, type FormatBytesOptions } from "../src"

describe("formatBytes", () => {
  describe("decimal definition", () => {
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

    test("sink", () => {
      expect(formatBytes(1024)).toMatchInlineSnapshot(`"1.02 kB"`)
      expect(formatBytes(1048576)).toMatchInlineSnapshot(`"1.05 MB"`)
      expect(formatBytes(1073741824)).toMatchInlineSnapshot(`"1.07 GB"`)
      expect(formatBytes(1099511627776)).toMatchInlineSnapshot(`"1.1 TB"`)
      expect(formatBytes(1023)).toMatchInlineSnapshot(`"1.02 kB"`)
      expect(formatBytes(1048575)).toMatchInlineSnapshot(`"1.05 MB"`)
      expect(formatBytes(1073741823)).toMatchInlineSnapshot(`"1.07 GB"`)
      expect(formatBytes(1099511627775)).toMatchInlineSnapshot(`"1.1 TB"`)
    })
  })

  describe("binary definition", () => {
    test("should format bytes correctly", () => {
      const options: FormatBytesOptions = { unitSystem: "binary", unit: "byte", unitDisplay: "short" }
      const result = formatBytes(1536, "en-US", options)
      expect(result).toMatchInlineSnapshot(`"1.5 kB"`)
    })

    test("should format bits correctly", () => {
      const options: FormatBytesOptions = { unitSystem: "binary", unit: "bit", unitDisplay: "short" }
      const result = formatBytes(1536, "en-US", options)
      expect(result).toMatchInlineSnapshot(`"1.5 kb"`)
    })

    test("should handle large byte values", () => {
      const options: FormatBytesOptions = { unitSystem: "binary", unit: "byte", unitDisplay: "short" }
      const result = formatBytes(1610612736, "en-US", options)
      expect(result).toMatchInlineSnapshot(`"1.5 GB"`)
    })

    test("sink", () => {
      expect(formatBytes(1024, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1 kB"`)
      expect(formatBytes(1048576, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1 MB"`)
      expect(formatBytes(1075200, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1.03 MB"`)
      expect(formatBytes(1073741824, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1 GB"`)
      expect(formatBytes(1148903751, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1.07 GB"`)
      expect(formatBytes(1099511627776, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1 TB"`)
      expect(formatBytes(1209462790553, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1.1 TB"`)
      expect(formatBytes(1022, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"0.998 kB"`)
      expect(formatBytes(1018, "en-US", { unitSystem: "binary", precision: 2 })).toMatchInlineSnapshot(`"0.99 kB"`)
      expect(formatBytes(1048575, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1 MB"`)
      expect(formatBytes(1073741823, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1 GB"`)
      expect(formatBytes(1099511627775, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1 TB"`)
    })
  })
})
