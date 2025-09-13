import { DateFormatter, getMinimumDayInMonth, getMinimumMonthInYear, type DateValue } from "@internationalized/date"
import { clampValue, match } from "@zag-js/utils"
import type {
  DateSegment,
  DateView,
  EditableSegmentType,
  IntlTranslations,
  Segments,
  SegmentType,
} from "./date-picker.types"
import type { DateGranularity } from "@zag-js/date-utils"

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
  placeholder() {
    return {
      day: "dd",
      month: "mm",
      year: "yyyy",
      hour: "--",
      minute: "--",
      second: "--",
      dayPeriod: "AM/PM",
      era: "era",
      timeZoneName: "timeZone",
      weekday: "weekday",
      unknown: "unknown",
      fractionalSecond: "ff",
    }
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

// ---------------------------------------------------
// SEGMENTS
// ---------------------------------------------------

export const EDITABLE_SEGMENTS = {
  year: true,
  month: true,
  day: true,
  hour: true,
  minute: true,
  second: true,
  dayPeriod: true,
  era: true,
  literal: false,
  timeZoneName: false,
  weekday: false,
  unknown: false,
  fractionalSecond: false,
} as const satisfies Record<keyof Intl.DateTimeFormatPartTypesRegistry, boolean>

export const PAGE_STEP = {
  year: 5,
  month: 2,
  day: 7,
  hour: 2,
  minute: 15,
  second: 15,
  dayPeriod: undefined,
  era: undefined,
  literal: undefined,
  timeZoneName: undefined,
  weekday: undefined,
  unknown: undefined,
  fractionalSecond: undefined,
} as const satisfies Record<keyof Segments, number | undefined>

export const TYPE_MAPPING = {
  // Node seems to convert everything to lowercase...
  dayperiod: "dayPeriod",
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts#named_years
  relatedYear: "year",
  yearName: "literal", // not editable
  unknown: "literal",
} as const

function getSafeType<TType extends keyof Intl.DateTimeFormatPartTypesRegistry>(type: TType): TType {
  return (TYPE_MAPPING as any)[type] ?? type
}

function getPlaceholder(type: EditableSegmentType, translations: IntlTranslations, locale: string): string {
  return translations.placeholder(locale)[type]
}

function isEditableSegment(type: keyof Intl.DateTimeFormatPartTypesRegistry): type is EditableSegmentType {
  return EDITABLE_SEGMENTS[type] === true
}

interface ProcessSegmentsProps {
  dateValue: Date
  displayValue: DateValue
  validSegments: Segments
  formatter: DateFormatter
  locale: string
  translations: IntlTranslations
  granularity: DateGranularity
}

export function processSegments({
  dateValue,
  displayValue,
  validSegments,
  formatter,
  locale,
  translations,
  granularity,
}: ProcessSegmentsProps): DateSegment[] {
  const timeValue = ["hour", "minute", "second"]
  const segments = formatter.formatToParts(dateValue)
  const resolvedOptions = formatter.resolvedOptions()
  const processedSegments: DateSegment[] = []

  for (const segment of segments) {
    const type = getSafeType(segment.type)
    let isEditable = isEditableSegment(type)
    if (type === "era" && displayValue.calendar.getEras().length === 1) {
      isEditable = false
    }

    const isPlaceholder = isEditable && !validSegments[type]
    const placeholder = isEditableSegment(type) ? getPlaceholder(type, translations, locale) : null

    const dateSegment = {
      type,
      text: isPlaceholder ? placeholder : segment.value,
      ...getSegmentLimits(displayValue, type, resolvedOptions),
      isPlaceholder,
      placeholder,
      isEditable,
    } as DateSegment

    // There is an issue in RTL languages where time fields render (minute:hour) instead of (hour:minute).
    // To force an LTR direction on the time field since, we wrap the time segments in LRI (left-to-right) isolate unicode. See https://www.w3.org/International/questions/qa-bidi-unicode-controls.
    // These unicode characters will be added to the array of processed segments as literals and will mark the start and end of the embedded direction change.
    if (type === "hour") {
      // This marks the start of the embedded direction change.
      processedSegments.push({
        type: "literal",
        text: "\u2066",
        ...getSegmentLimits(displayValue, "literal", resolvedOptions),
        isPlaceholder: false,
        placeholder: "",
        isEditable: false,
      })
      processedSegments.push(dateSegment)
      // This marks the end of the embedded direction change in the case that the granularity it set to "hour".
      if (type === granularity) {
        processedSegments.push({
          type: "literal",
          text: "\u2069",
          ...getSegmentLimits(displayValue, "literal", resolvedOptions),
          isPlaceholder: false,
          placeholder: "",
          isEditable: false,
        })
      }
    } else if (timeValue.includes(type) && type === granularity) {
      processedSegments.push(dateSegment)
      // This marks the end of the embedded direction change.
      processedSegments.push({
        type: "literal",
        text: "\u2069",
        ...getSegmentLimits(displayValue, "literal", resolvedOptions),
        isPlaceholder: false,
        placeholder: "",
        isEditable: false,
      })
    } else {
      // We only want to "wrap" the unicode around segments that are hour, minute, or second. If they aren't, just process as normal.
      processedSegments.push(dateSegment)
    }
  }

  return processedSegments
}

function getSegmentLimits(date: DateValue, type: string, options: Intl.ResolvedDateTimeFormatOptions) {
  switch (type) {
    case "era": {
      const eras = date.calendar.getEras()
      return {
        value: eras.indexOf(date.era),
        minValue: 0,
        maxValue: eras.length - 1,
      }
    }
    case "year":
      return {
        value: date.year,
        minValue: 1,
        maxValue: date.calendar.getYearsInEra(date),
      }
    case "month":
      return {
        value: date.month,
        minValue: getMinimumMonthInYear(date),
        maxValue: date.calendar.getMonthsInYear(date),
      }
    case "day":
      return {
        value: date.day,
        minValue: getMinimumDayInMonth(date),
        maxValue: date.calendar.getDaysInMonth(date),
      }
  }

  if ("hour" in date) {
    switch (type) {
      case "dayPeriod":
        return {
          value: date.hour >= 12 ? 12 : 0,
          minValue: 0,
          maxValue: 12,
        }
      case "hour":
        if (options.hour12) {
          const isPM = date.hour >= 12
          return {
            value: date.hour,
            minValue: isPM ? 12 : 0,
            maxValue: isPM ? 23 : 11,
          }
        }

        return {
          value: date.hour,
          minValue: 0,
          maxValue: 23,
        }
      case "minute":
        return {
          value: date.minute,
          minValue: 0,
          maxValue: 59,
        }
      case "second":
        return {
          value: date.second,
          minValue: 0,
          maxValue: 59,
        }
    }
  }

  return {}
}

export function addSegment(
  value: DateValue,
  type: SegmentType,
  amount: number,
  options: Intl.ResolvedDateTimeFormatOptions,
) {
  switch (type) {
    case "era":
    case "year":
    case "month":
    case "day":
      return value.cycle(type, amount, { round: type === "year" })
  }

  if ("hour" in value) {
    switch (type) {
      case "dayPeriod": {
        let hours = value.hour
        let isPM = hours >= 12
        return value.set({ hour: isPM ? hours - 12 : hours + 12 })
      }
      case "hour":
      case "minute":
      case "second":
        return value.cycle(type, amount, {
          round: type !== "hour",
          hourCycle: options.hour12 ? 12 : 24,
        })
    }
  }

  throw new Error("Unknown segment: " + type)
}

export function setSegment(
  value: DateValue,
  part: string,
  segmentValue: number | string,
  options: Intl.ResolvedDateTimeFormatOptions,
) {
  switch (part) {
    case "day":
    case "month":
    case "year":
    case "era":
      return value.set({ [part]: segmentValue })
  }

  if ("hour" in value && typeof segmentValue === "number") {
    switch (part) {
      case "dayPeriod": {
        let hours = value.hour
        let wasPM = hours >= 12
        let isPM = segmentValue >= 12
        if (isPM === wasPM) {
          return value
        }
        return value.set({ hour: wasPM ? hours - 12 : hours + 12 })
      }
      case "hour":
        // In 12 hour time, ensure that AM/PM does not change
        if (options.hour12) {
          let hours = value.hour
          let wasPM = hours >= 12
          if (!wasPM && segmentValue === 12) {
            segmentValue = 0
          }
          if (wasPM && segmentValue < 12) {
            segmentValue += 12
          }
        }
      // fallthrough
      case "minute":
      case "second":
        return value.set({ [part]: segmentValue })
    }
  }

  throw new Error("Unknown segment: " + part)
}

export function getDefaultValidSegments(value: DateValue[] | undefined, allSegments: Segments) {
  return value?.length ? value.map((date) => (date ? { ...allSegments } : {})) : [{}]
}
