import { NumberParser } from "@internationalized/number"
import { roundToStepPrecision } from "@zag-js/utils"
import type { Params } from "@zag-js/core"
import type { NumberInputSchema } from "./number-input.types"

export const createFormatter = (locale: string, options: Intl.NumberFormatOptions = {}) => {
  return new Intl.NumberFormat(locale, options)
}

export const createParser = (locale: string, options: Intl.NumberFormatOptions = {}) => {
  return new NumberParser(locale, options)
}

type Ctx = Pick<Params<NumberInputSchema>, "prop" | "computed">

const MINUS_SIGNS = /[\u2012\u2013\u2014\u2212\uFE63\uFF0D]/g
const PERSIAN_DIGITS = /[\u06F0-\u06F9]/g

// CJK keyboards type these in full-width mode
const FULLWIDTH_DECIMAL = /\uFF0E/g
const FULLWIDTH_GROUP = /\uFF0C/g

export const normalizeNumberText = (value: string) =>
  value
    .replace(MINUS_SIGNS, "-")
    .replace(PERSIAN_DIGITS, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(FULLWIDTH_DECIMAL, ".")
    .replace(FULLWIDTH_GROUP, "")

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
export function snapToStep(value: number, base: number, step: number, direction: number) {
  // Absorbs float noise, so 0.1 + 0.2 still counts as on the grid
  const tolerance = 1e-10
  const steps = (value - base) / step
  const snapped = direction > 0 ? Math.floor(steps + tolerance) : Math.ceil(steps - tolerance)
  return roundToStepPrecision(base + snapped * step, step)
}
