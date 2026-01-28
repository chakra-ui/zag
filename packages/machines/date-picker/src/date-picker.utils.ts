import { DateFormatter, type DateValue } from "@internationalized/date"
import { memo } from "@zag-js/core"
import { getDecadeRange } from "@zag-js/date-utils"
import { clampValue, match } from "@zag-js/utils"
import type { DateView, IntlTranslations, SelectionMode, VisibleRangeText } from "./date-picker.types"

export function adjustStartAndEndDate(value: Array<DateValue | null | undefined>): DateValue[] {
  const [startDate, endDate] = value
  let result: Array<DateValue | null | undefined>
  if (!startDate || !endDate) result = value
  else result = startDate.compare(endDate) <= 0 ? value : [endDate, startDate]
  return result as DateValue[]
}

export function isDateWithinRange(date: DateValue, value: Array<DateValue | null | undefined>) {
  const [startDate, endDate] = value
  if (!startDate || !endDate) return false
  return startDate.compare(date) <= 0 && endDate.compare(date) >= 0
}

export function sortDates(values: Array<DateValue | null | undefined>) {
  return values
    .slice()
    .filter((date): date is DateValue => date != null)
    .sort((a, b) => a.compare(b))
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
    const [start = "", end = ""] = value
    return `select ${start} to ${end}`
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

interface VisibleRangeTextOptions {
  view: DateView
  startValue: DateValue
  endValue: DateValue
  locale: string
  timeZone: string
  selectionMode: SelectionMode
}

export const getVisibleRangeText = memo(
  (opts: VisibleRangeTextOptions) => [opts.view, opts.startValue.toString(), opts.endValue.toString(), opts.locale],
  ([view], opts): VisibleRangeText => {
    const { startValue, endValue, locale, timeZone, selectionMode } = opts

    if (view === "year") {
      const years = getDecadeRange(startValue.year, { strict: true })
      const start = years.at(0)!.toString()
      const end = years.at(-1)!.toString()
      return { start, end, formatted: `${start} - ${end}` }
    }

    if (view === "month") {
      const formatter = new DateFormatter(locale, { year: "numeric", timeZone })
      const start = formatter.format(startValue.toDate(timeZone))
      const end = formatter.format(endValue.toDate(timeZone))
      const formatted = selectionMode === "range" ? `${start} - ${end}` : start
      return { start, end, formatted }
    }

    const formatter = new DateFormatter(locale, { month: "long", year: "numeric", timeZone })
    const start = formatter.format(startValue.toDate(timeZone))
    const end = formatter.format(endValue.toDate(timeZone))
    const formatted = selectionMode === "range" ? `${start} - ${end}` : start
    return { start, end, formatted }
  },
)
