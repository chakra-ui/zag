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
  return computed("parser").parse(String(value))
}

export const formatValue = (value: number, params: Ctx): string => {
  const { prop, computed } = params
  if (Number.isNaN(value)) return ""
  if (!prop("formatOptions")) return value.toString()
  return computed("formatter").format(value)
}
