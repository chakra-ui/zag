import { DateFormatter, toCalendarDate, type DateValue } from "@internationalized/date"
import { clampValue, match } from "@zag-js/utils"
import type { DateView, IntlTranslations } from "./date-picker.types"

export function adjustStartAndEndDate(value: DateValue[]) {
  const [startDate, endDate] = value
  if (!startDate || !endDate) return value
  return startDate.compare(endDate) <= 0 ? value : [endDate, startDate]
}

export function isDateWithinRange(date: DateValue, value: (DateValue | null)[]) {
  const [startDate, endDate] = value
  if (!startDate || !endDate) return false
  return (
    toCalendarDate(startDate).compare(toCalendarDate(date)) <= 0 &&
    toCalendarDate(endDate).compare(toCalendarDate(date)) >= 0
  )
}

export function sortDates(values: DateValue[]) {
  return values.slice().sort((a, b) => a.compare(b))
}

export function getRoleDescription(view: DateView) {
  return match(view, {
    year: "calendar decade",
    month: "calendar year",
    day: "calendar month",
  })
}

const PLACEHOLDERS: Record<string, string> = {
  day: "dd",
  month: "mm",
  year: "yyyy",
}

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

export const isValidDate = (value: DateValue) => {
  return !Number.isNaN(value.day) && !Number.isNaN(value.month) && !Number.isNaN(value.year)
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

export const defaultTranslations: IntlTranslations = {
  dayCell(state) {
    if (state.unavailable) return `Not available. ${state.formattedDate}`
    if (state.selected) return `Selected date. ${state.formattedDate}`
    return `Choose ${state.formattedDate}`
  },
  trigger(open) {
    return open ? "Close calendar" : "Open calendar"
  },
  viewTrigger(view) {
    return match(view, {
      year: "Switch to month view",
      month: "Switch to day view",
      day: "Switch to year view",
    })
  },
  presetTrigger(value) {
    return Array.isArray(value) ? `select ${value[0].toString()} to ${value[1].toString()}` : `select ${value}`
  },
  prevTrigger(view) {
    return match(view, {
      year: "Switch to previous decade",
      month: "Switch to previous year",
      day: "Switch to previous month",
    })
  },
  nextTrigger(view) {
    return match(view, {
      year: "Switch to next decade",
      month: "Switch to next year",
      day: "Switch to next month",
    })
  },
  // TODO: Revisit this
  placeholder() {
    return { day: "dd", month: "mm", year: "yyyy" }
  },
  content: "calendar",
  monthSelect: "Select month",
  yearSelect: "Select year",
  clearTrigger: "Clear selected dates",
}

// 0 – day, 1 – month, 2 – year;
type DateViewNumber = 0 | 1 | 2

function viewToNumber(view: DateView | undefined, fallback: DateViewNumber | undefined): DateViewNumber {
  if (!view) return fallback || 0
  return view === "day" ? 0 : view === "month" ? 1 : 2
}

function viewNumberToView(viewNumber: DateViewNumber | undefined): DateView {
  return viewNumber === 0 ? "day" : viewNumber === 1 ? "month" : "year"
}

export function clampView(
  view: DateView | undefined,
  minView: DateView | undefined,
  maxView: DateView | undefined,
): DateView {
  return viewNumberToView(
    clampValue(viewToNumber(view, 0), viewToNumber(minView, 0), viewToNumber(maxView, 2)) as DateViewNumber,
  )
}

export function isAboveMinView(view: DateView, minView: DateView) {
  return viewToNumber(view, 0) > viewToNumber(minView, 0)
}

export function isBelowMinView(view: DateView, minView: DateView) {
  return viewToNumber(view, 0) < viewToNumber(minView, 0)
}

export function getNextView(view: DateView, minView: DateView, maxView: DateView) {
  const nextViewNumber = (viewToNumber(view, 0) + 1) as DateViewNumber
  return clampView(viewNumberToView(nextViewNumber), minView, maxView)
}

export function getPreviousView(view: DateView, minView: DateView, maxView: DateView) {
  const prevViewNumber = (viewToNumber(view, 0) - 1) as DateViewNumber
  return clampView(viewNumberToView(prevViewNumber), minView, maxView)
}

const views: DateView[] = ["day", "month", "year"]
export function eachView(cb: (view: DateView) => void) {
  views.forEach((view) => cb(view))
}
