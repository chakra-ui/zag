import { parseDate, type DateValue } from "@internationalized/date"

export function parse(value: string): DateValue
export function parse(value: string[]): DateValue[]
export function parse(value: string | string[]) {
  if (Array.isArray(value)) {
    return value.map((v) => parseDate(v)) as DateValue[]
  }
  return parseDate(value) as DateValue
}
