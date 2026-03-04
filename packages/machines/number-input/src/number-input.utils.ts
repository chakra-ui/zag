import { NumberParser } from "@internationalized/number"
import type { Params } from "@zag-js/core"
import type { NumberInputSchema } from "./number-input.types"

export const createFormatter = (locale: string, options: Intl.NumberFormatOptions = {}) => {
  return new Intl.NumberFormat(locale, options)
}

export const createParser = (locale: string, options: Intl.NumberFormatOptions = {}) => {
  return new NumberParser(locale, options)
}

type Ctx = Pick<Params<NumberInputSchema>, "prop" | "computed">

export const parseValue = (value: string, params: Ctx) => {
  const { prop, computed } = params
  if (!prop("formatOptions")) return parseFloat(value)
  if (value === "") return Number.NaN
  return computed("parser").parse(value)
}

export const formatValue = (value: number, params: Ctx): string => {
  const { prop, computed } = params
  if (Number.isNaN(value)) return ""
  if (!prop("formatOptions")) return value.toString()
  return computed("formatter").format(value)
}

export const getDefaultStep = (step: number | undefined, formatOptions: Intl.NumberFormatOptions | undefined) => {
  let defaultStep = step !== undefined && !Number.isNaN(step) ? step : 1
  if (formatOptions?.style === "percent" && (step === undefined || Number.isNaN(step))) {
    defaultStep = 0.01
  }
  return defaultStep
}
