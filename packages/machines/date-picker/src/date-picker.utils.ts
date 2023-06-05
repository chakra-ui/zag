import { DateFormatter, type DateValue } from "@internationalized/date"
import type { DateView, MachineContext } from "./date-picker.types"

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

export function matchView<T>(view: DateView, values: { year: T; month: T; day: T }) {
  if (view === "year") return values.year
  if (view === "month") return values.month
  return values.day
}

export function formatValue(ctx: Pick<MachineContext, "locale" | "timeZone" | "selectionMode" | "value">) {
  const formatter = new DateFormatter(ctx.locale, {
    timeZone: ctx.timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  if (ctx.selectionMode === "range") {
    const [startDate, endDate] = ctx.value
    if (!startDate || !endDate) return ""
    return `${formatter.format(startDate.toDate(ctx.timeZone))} - ${formatter.format(endDate.toDate(ctx.timeZone))}`
  }

  if (ctx.selectionMode === "single") {
    const [startValue] = ctx.value
    if (!startValue) return ""
    return formatter.format(startValue.toDate(ctx.timeZone))
  }

  return ctx.value.map((date) => formatter.format(date.toDate(ctx.timeZone))).join(", ")
}

export function getNextTriggerLabel(view: DateView) {
  return matchView(view, {
    year: "Switch to next decade",
    month: "Switch to next year",
    day: "Switch to next month",
  })
}

export function getPrevTriggerLabel(view: DateView) {
  return matchView(view, {
    year: "Switch to previous decade",
    month: "Switch to previous year",
    day: "Switch to previous month",
  })
}

export function getRoleDescription(view: DateView) {
  return matchView(view, {
    year: "calendar decade",
    month: "calendar year",
    day: "calendar month",
  })
}

export function getViewTriggerLabel(view: DateView) {
  return matchView(view, {
    year: "Switch to month view",
    month: "Switch to day view",
    day: "Switch to year view",
  })
}

const PLACEHOLDERS = { day: "dd", month: "mm", year: "yyyy" }

export function getInputPlaceholder(locale: string) {
  return new DateFormatter(locale)
    .formatToParts(new Date())
    .map((item) => PLACEHOLDERS[item.type] ?? item.value)
    .join("")
}

export const isValidCharacter = (char: string | null, separator: string) => {
  if (!char) return true
  return /\d/.test(char) || char === separator || char.length !== 1
}

export const ensureValidCharacters = (value: string, separator: string) => {
  return value
    .split("")
    .filter((char) => isValidCharacter(char, separator))
    .join("")
}

export function getLocaleSeparator(locale: string) {
  const dateFormatter = new Intl.DateTimeFormat(locale)
  const parts = dateFormatter.formatToParts(new Date())
  const literalPart = parts.find((part) => part.type === "literal")
  return literalPart ? literalPart.value : "/"
}
