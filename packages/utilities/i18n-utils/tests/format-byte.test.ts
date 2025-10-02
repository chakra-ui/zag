import { formatBytes, type FormatBytesOptions } from "../src"

describe("formatBytes", () => {
  describe("edge cases", () => {
    test("should return empty string for NaN", () => {
      const result = formatBytes(NaN)
      expect(result).toMatchInlineSnapshot(`""`)
    })

    test("should return '0 B' for 0 bytes", () => {
      const result = formatBytes(0)
      expect(result).toMatchInlineSnapshot(`"0 B"`)
    })

    test("should handle negative values", () => {
      expect(formatBytes(-1500)).toMatchInlineSnapshot(`"-1.5 kB"`)
      expect(formatBytes(-1048576, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"-1 MB"`)
    })

    test("should handle very small values", () => {
      expect(formatBytes(1)).toMatchInlineSnapshot(`"1 byte"`)
      expect(formatBytes(0.5)).toMatchInlineSnapshot(`"0.5 byte"`)
      expect(formatBytes(100)).toMatchInlineSnapshot(`"100 byte"`)
    })

    test("should handle Infinity", () => {
      expect(formatBytes(Infinity)).toMatchInlineSnapshot(`"∞ PB"`)
      expect(formatBytes(-Infinity)).toMatchInlineSnapshot(`"-∞ PB"`)
    })
  })

  describe("decimal definition", () => {
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

    test("should handle very large values (petabyte)", () => {
      expect(formatBytes(1e15)).toMatchInlineSnapshot(`"1 PB"`)
      expect(formatBytes(1.5e15)).toMatchInlineSnapshot(`"1.5 PB"`)
      expect(formatBytes(2.5e15)).toMatchInlineSnapshot(`"2.5 PB"`)
    })

    test("should handle boundary values", () => {
      expect(formatBytes(999)).toMatchInlineSnapshot(`"999 byte"`)
      expect(formatBytes(1000)).toMatchInlineSnapshot(`"1 kB"`)
      expect(formatBytes(999999)).toMatchInlineSnapshot(`"1,000 kB"`)
      expect(formatBytes(1000000)).toMatchInlineSnapshot(`"1 MB"`)
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

  describe("precision control", () => {
    test("should respect different precision values", () => {
      expect(formatBytes(1234567, "en-US", { precision: 1 })).toMatchInlineSnapshot(`"1 MB"`)
      expect(formatBytes(1234567, "en-US", { precision: 2 })).toMatchInlineSnapshot(`"1.2 MB"`)
      expect(formatBytes(1234567, "en-US", { precision: 3 })).toMatchInlineSnapshot(`"1.23 MB"`)
      // toPrecision gives 1.2346, but Intl.NumberFormat rounds it to 1.235
      expect(formatBytes(1234567, "en-US", { precision: 5 })).toMatchInlineSnapshot(`"1.235 MB"`)
    })

    test("should handle precision with toPrecision rounding", () => {
      // toPrecision rounds, so 1.2345... becomes 1.235 with precision 4
      expect(formatBytes(1234567, "en-US", { precision: 4 })).toMatchInlineSnapshot(`"1.235 MB"`)
    })
  })

  describe("unit display modes", () => {
    test("should format with long unit display", () => {
      expect(formatBytes(1500, "en-US", { unitDisplay: "long" })).toMatchInlineSnapshot(`"1.5 kilobytes"`)
      expect(formatBytes(1500000, "en-US", { unitDisplay: "long" })).toMatchInlineSnapshot(`"1.5 megabytes"`)
    })

    test("should format with short unit display", () => {
      expect(formatBytes(1500, "en-US", { unitDisplay: "short" })).toMatchInlineSnapshot(`"1.5 kB"`)
      expect(formatBytes(1500000, "en-US", { unitDisplay: "short" })).toMatchInlineSnapshot(`"1.5 MB"`)
    })

    test("should format with narrow unit display", () => {
      expect(formatBytes(1500, "en-US", { unitDisplay: "narrow" })).toMatchInlineSnapshot(`"1.5kB"`)
      expect(formatBytes(1500000, "en-US", { unitDisplay: "narrow" })).toMatchInlineSnapshot(`"1.5MB"`)
    })
  })

  describe("bits vs bytes", () => {
    test("should format bits with different scales", () => {
      expect(formatBytes(1500, "en-US", { unit: "bit" })).toMatchInlineSnapshot(`"1.5 kb"`)
      expect(formatBytes(1500000, "en-US", { unit: "bit" })).toMatchInlineSnapshot(`"1.5 Mb"`)
      expect(formatBytes(1500000000, "en-US", { unit: "bit" })).toMatchInlineSnapshot(`"1.5 Gb"`)
      expect(formatBytes(1500000000000, "en-US", { unit: "bit" })).toMatchInlineSnapshot(`"1.5 Tb"`)
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

    test("should handle very large binary values (petabyte)", () => {
      const peta = Math.pow(1024, 5)

      expect(formatBytes(peta, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1 PB"`)
      expect(formatBytes(1.5 * peta, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1.5 PB"`)
      expect(formatBytes(2 * peta, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"2 PB"`)
    })

    test("should handle boundary values", () => {
      expect(formatBytes(1023, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1,020 byte"`)
      expect(formatBytes(1024, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1 kB"`)
      expect(formatBytes(1025, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1 kB"`)
    })

    test("sink", () => {
      expect(formatBytes(1024, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1 kB"`)
      expect(formatBytes(1048576, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1 MB"`)
      expect(formatBytes(1075200, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1.03 MB"`)
      expect(formatBytes(1073741824, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1 GB"`)
      expect(formatBytes(1148903751, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1.07 GB"`)
      expect(formatBytes(1099511627776, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1 TB"`)
      expect(formatBytes(1209462790553, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1.1 TB"`)
      expect(formatBytes(1022, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1,020 byte"`)
      expect(formatBytes(1018, "en-US", { unitSystem: "binary", precision: 2 })).toMatchInlineSnapshot(`"1,000 byte"`)
      expect(formatBytes(1048575, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1,020 kB"`)
      expect(formatBytes(1073741823, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1,020 MB"`)
      expect(formatBytes(1099511627775, "en-US", { unitSystem: "binary" })).toMatchInlineSnapshot(`"1,020 GB"`)
    })
  })

  describe("locale variations", () => {
    test("should format with different locales", () => {
      expect(formatBytes(1500, "de-DE")).toMatchInlineSnapshot(`"1,5 kB"`)
      expect(formatBytes(1500, "fr-FR")).toMatchInlineSnapshot(`"1,5 ko"`)
      expect(formatBytes(1500000, "ja-JP")).toMatchInlineSnapshot(`"1.5 MB"`)
    })
  })
})
