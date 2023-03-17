import { CalendarDate, DateFormatter } from "@internationalized/date"
import type { DateView } from "./date-picker.types"

export function adjustStartAndEndDate(value: CalendarDate[]) {
  const [startDate, endDate] = value
  if (!startDate || !endDate) return value
  return startDate.compare(endDate) <= 0 ? value : [endDate, startDate]
}

export function isDateWithinRange(date: CalendarDate, value: (CalendarDate | null)[]) {
  const [startDate, endDate] = value
  if (!startDate || !endDate) return false
  return startDate.compare(date) <= 0 && endDate.compare(date) >= 0
}

export function sortDates(values: CalendarDate[]) {
  return values.sort((a, b) => a.compare(b))
}

export function matchView<T>(view: DateView, values: { year: T; month: T; day: T }) {
  if (view === "year") return values.year
  if (view === "month") return values.month
  return values.day
}

export function formatValue(value: CalendarDate[], locale: string, timeZone: string) {
  const formatter = new DateFormatter(locale, {
    timeZone: timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
  return value.map((date) => formatter.format(date.toDate(timeZone)).toString()).join(", ")
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
