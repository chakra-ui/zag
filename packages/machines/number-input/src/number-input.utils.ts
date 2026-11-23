import { decimalsOf } from "@zag-js/utils/number"
import type { Params } from "@zag-js/core"
import type { NumberInputSchema } from "./number-input.types"
import { createNumberParser } from "./number-parser"

/**
 * Intl shows at most 3 decimals by default, so a 0.0001 step would show as 0. Without a maximum of
 * your own, the step's decimals show, and never fewer than Intl would (yen stay whole, dollars show cents).
 */
export const createFormatter = (locale: string, options: Intl.NumberFormatOptions = {}, step = 1) => {
  const formatter = new Intl.NumberFormat(locale, options)
  if (options.maximumFractionDigits != null || options.maximumSignificantDigits != null) return formatter
  const decimals = decimalsOf(step) - (options.style === "percent" ? 2 : 0)
  const { maximumFractionDigits = 0, minimumFractionDigits = 0 } = formatter.resolvedOptions()
  if (decimals <= maximumFractionDigits) return formatter
  return new Intl.NumberFormat(locale, {
    ...options,
    maximumFractionDigits: Math.min(Math.max(decimals, minimumFractionDigits), 100),
  })
}

export const createParser = (locale: string, options: Intl.NumberFormatOptions = {}) => {
  return createNumberParser(locale, options)
}

type Ctx = Pick<Params<NumberInputSchema>, "prop" | "computed">

const MINUS_SIGNS = /[\u2012\u2013\u2014\u2212\uFE63\uFF0D]/g

// CJK keyboards type these in full-width mode
const FULLWIDTH_DECIMAL = /\uFF0E/g
const FULLWIDTH_GROUP = /\uFF0C/g

export const normalizeNumberText = (value: string) =>
  value.replace(MINUS_SIGNS, "-").replace(FULLWIDTH_DECIMAL, ".").replace(FULLWIDTH_GROUP, "")

export const parseValue = (input: string, params: Ctx) => {
  const { computed } = params
  const value = normalizeNumberText(input)
  if (value === "") return Number.NaN
  return computed("parser").parse(value)
}

export const formatNumber = (
  value: number | null | undefined,
  formatter: Intl.NumberFormat,
  formatOptions: Intl.NumberFormatOptions | undefined,
): string => {
  if (value == null || Number.isNaN(value)) return ""
  if (formatOptions) return formatter.format(value)
  const decimal = formatter.formatToParts(1.1).find((part) => part.type === "decimal")?.value ?? "."
  return value.toString().replace(".", decimal)
}

export const formatValue = (value: number | null, params: Ctx): string => {
  const { prop, computed } = params
  return formatNumber(value, computed("formatter"), prop("formatOptions"))
}

export const getDefaultStep = (step: number | undefined, formatOptions: Intl.NumberFormatOptions | undefined) => {
  let defaultStep = step !== undefined && !Number.isNaN(step) ? step : 1
  if (formatOptions?.style === "percent" && (step === undefined || Number.isNaN(step))) {
    defaultStep = 0.01
  }
  return defaultStep
}

/**
 * Snaps a stepped value onto the step grid, rounding toward where it came from,
 * so 5.5 + 1 lands on 6 rather than 7.
 */
