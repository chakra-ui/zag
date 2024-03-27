import { DateFormatter, type DateValue } from "@internationalized/date"
import { match } from "@zag-js/utils"
import type { DateView } from "./date-time-picker.types"

export function adjustStartAndEndDate(value: DateValue[]) {
  const [startDate, endDate] = value
  if (!startDate || !endDate) return value
  return startDate.compare(endDate) <= 0 ? value : [endDate, startDate]
}

export function isDateWithinRange(date: DateValue, value: (DateValue | null)[]) {
  const [startDate, endDate] = value
  if (!startDate || !endDate) return false
  return startDate.compare(date) <= 0 && endDate.compare(date) >= 0
}

export function sortDates(values: DateValue[]) {
  return values.sort((a, b) => a.compare(b))
}

export function getNextTriggerLabel(view: DateView) {
  return match(view, {
    year: "Switch to next decade",
    month: "Switch to next year",
    day: "Switch to next month",
  })
}

export function getPrevTriggerLabel(view: DateView) {
  return match(view, {
    year: "Switch to previous decade",
    month: "Switch to previous year",
    day: "Switch to previous month",
  })
}

export function getRoleDescription(view: DateView) {
  return match(view, {
    year: "calendar decade",
    month: "calendar year",
    day: "calendar month",
  })
}

export function getViewTriggerLabel(view: DateView) {
  return match(view, {
    year: "Switch to month view",
    month: "Switch to day view",
    day: "Switch to year view",
  })
}

const PLACEHOLDERS = { minute: "MM", hour: "HH", day: "dd", month: "mm", year: "yyyy" }

export function getInputPlaceholder(locale: string) {
  const opts = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  } as const
  return new DateFormatter(locale, opts)
    .formatToParts(new Date())
    .map((part) => PLACEHOLDERS[part.type] || part.value)
    .join("")
    .replace(",", "")
}

export const isValidCharacter = (char: string | null, separator: string) => {
  if (!char) return true
  return /\d/.test(char) || char === separator || char.length !== 1 || separator.includes(char)
}

export const ensureValidCharacters = (value: string, separator: string) => {
  return value
    .split("")
    .filter((char) => isValidCharacter(char, separator))
    .join("")
}

export function getLocaleSeparator(locale: string) {
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  const parts = dateFormatter.formatToParts(new Date())
  const separators = parts
    .filter((part) => part.type === "literal")
    .map((part) => part.value)
    .join("")
  const uniqueSeparators = Array.from(new Set(separators.split("")))
    .filter((sep) => ["/", ":", " "].includes(sep))
    .join("")
  return uniqueSeparators.length > 0 ? uniqueSeparators : "/:"
}
