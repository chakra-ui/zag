import { formatNumber } from "@zag-js/i18n-utils"

const bitPrefixes = ["", "kilo", "mega", "giga", "tera"]
const bytePrefixes = ["", "kilo", "mega", "giga", "tera", "peta"]

interface FormatBytesOptions {
  unit?: "bit" | "byte"
  unitDisplay?: "long" | "short" | "narrow"
}

export const formatBytes = (bytes: number, locale = "en-US", options: FormatBytesOptions = {}) => {
  if (isNaN(bytes)) return ""
  if (bytes === 0) return "0 B"

  const { unit = "byte", unitDisplay = "short" } = options

  const prefix = unit === "bit" ? bitPrefixes : bytePrefixes
  const index = Math.max(0, Math.min(Math.floor(Math.log10(bytes) / 3), prefix.length - 1))

  const _unit = prefix[index] + unit
  const _unitDisplay = unitDisplay || "short"

  const v = parseFloat((bytes / Math.pow(1000, index)).toPrecision(3))

  return formatNumber(v, locale, {
    style: "unit",
    unit: _unit,
    unitDisplay: _unitDisplay,
  })
}
