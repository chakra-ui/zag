import { NumberParser } from "@internationalized/number"
import { ref } from "@zag-js/core"
import type { MachineContext } from "./number-input.types"

const defaultFormatOptions: Intl.NumberFormatOptions = {
  style: "decimal",
  minimumFractionDigits: 0,
  maximumFractionDigits: 20,
}

export const createFormatter = (locale: string, options: Intl.NumberFormatOptions = {}) => {
  const formatOptions = Object.assign({}, defaultFormatOptions, options)
  return ref(new Intl.NumberFormat(locale, formatOptions))
}

export const createParser = (locale: string, options: Intl.NumberFormatOptions = {}) => {
  const formatOptions = Object.assign({}, defaultFormatOptions, options)
  return ref(new NumberParser(locale, formatOptions))
}

export const parseValue = (ctx: MachineContext, value: string) => {
  return ctx.parser.parse(String(value))
}

export const nan = (value: any, fallback: any) => {
  return Number.isNaN(value) ? fallback : value
}

export const formatValue = (ctx: MachineContext, value: number): string => {
  if (Number.isNaN(value)) return ""
  return ctx.formatter.format(value)
}
