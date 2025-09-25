import { formatNumber } from "./format-number"

const bitPrefixes = ["", "kilo", "mega", "giga", "tera"]
const bytePrefixes = ["", "kilo", "mega", "giga", "tera", "peta"]

export interface FormatBytesOptions {
  /**
   * The number of significant digits to include in the formatted output.
   * @default 3
   */
  precision?: number | undefined
  /**
   * The unit system to use for calculations.
   * - "binary": Uses 1024 as the base (e.g., 1 KiB = 1024 bytes)
   * - "decimal": Uses 1000 as the base (e.g., 1 KB = 1000 bytes)
   * @default "decimal"
   */
  unitSystem?: "binary" | "decimal" | undefined
  /**
   * The type of unit to format the value as.
   * - "bit": Format as bits (b)
   * - "byte": Format as bytes (B)
   * @default "byte"
   */
  unit?: "bit" | "byte" | undefined
  /**
   * The display style for the unit.
   * - "long": Full unit name (e.g., "kilobytes")
   * - "short": Abbreviated unit (e.g., "KB")
   * - "narrow": Compact unit (e.g., "K")
   * @default "short"
   */
  unitDisplay?: "long" | "short" | "narrow" | undefined
}

export const formatBytes = (bytes: number, locale = "en-US", options: FormatBytesOptions = {}) => {
  if (Number.isNaN(bytes)) return ""
  if (bytes === 0) return "0 B"

  const { unitSystem = "decimal", precision = 3, unit = "byte", unitDisplay = "short" } = options

  const factor = unitSystem === "binary" ? 1024 : 1000

  const prefix = unit === "bit" ? bitPrefixes : bytePrefixes
  const index = Math.max(0, Math.min(Math.floor(Math.log10(bytes) / 3), prefix.length - 1))

  const v = parseFloat((bytes / Math.pow(factor, index)).toPrecision(precision))

  return formatNumber(v, locale, {
    style: "unit",
    unit: prefix[index] + unit,
    unitDisplay,
  })
}
