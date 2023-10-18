import { CalendarDate, parseDate, type DateValue } from "@internationalized/date"

export function parse(value: string | Date): DateValue
export function parse(value: string[] | Date[]): DateValue[]
export function parse(value: any) {
  if (Array.isArray(value)) {
    return value.map((v) => parse(v))
  }

  if (value instanceof Date) {
    return new CalendarDate(value.getFullYear(), value.getMonth() + 1, value.getDate()) as DateValue
  }

  return parseDate(value)
}
