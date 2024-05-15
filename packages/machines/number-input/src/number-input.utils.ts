import { NumberParser } from "@internationalized/number"
import { ref } from "@zag-js/core"
import type { MachineContext } from "./number-input.types"

export const createFormatter = (locale: string, options: Intl.NumberFormatOptions = {}) => {
  return ref(new Intl.NumberFormat(locale, options))
}

export const createParser = (locale: string, options: Intl.NumberFormatOptions = {}) => {
  return ref(new NumberParser(locale, options))
}

export const parseValue = (ctx: MachineContext, value: string) => {
  if (!ctx.formatOptions) return parseFloat(value)
  return ctx.parser.parse(String(value))
}

export const formatValue = (ctx: MachineContext, value: number): string => {
  if (Number.isNaN(value)) return ""
  if (!ctx.formatOptions) return value.toString()
  return ctx.formatter.format(value)
}
