import { DateFormatter, getMinimumDayInMonth, getMinimumMonthInYear, type DateValue } from "@internationalized/date"
import type { DateGranularity } from "@zag-js/date-utils"
import type { DateSegment, EditableSegmentType, IntlTranslations, Segments } from "../date-field.types"

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

const SEGMENT_LABELS: Record<string, string> = {
  era: "Era",
  year: "Year",
  month: "Month",
  day: "Day",
  hour: "Hour",
  minute: "Minute",
  second: "Second",
  dayPeriod: "AM/PM",
  timeZoneName: "Time zone",
}

export function getSegmentLabel(type: string): string {
  return SEGMENT_LABELS[type] ?? type
}

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
    let placeholder = isEditableSegment(type) ? getPlaceholder(type, translations, locale) : null
    // For dayPeriod and era, use the formatted value from the display date to avoid layout shift
    if ((type === "dayPeriod" || type === "era") && segment.value) {
      placeholder = segment.value
    }

    const dateSegment = {
      type,
      text: isPlaceholder ? placeholder : segment.value,
      ...getSegmentLimits(displayValue, type, resolvedOptions),
      isPlaceholder,
      placeholder,
      isEditable,
    } as DateSegment

    // There is an issue in RTL languages where time fields render (minute:hour) instead of (hour:minute).
    // To force an LTR direction on the time field, we wrap time segments in LRI (left-to-right isolate) unicode.
    // See https://www.w3.org/International/questions/qa-bidi-unicode-controls
    if (type === "hour") {
      processedSegments.push({
        type: "literal",
        text: "\u2066",
        ...getSegmentLimits(displayValue, "literal", resolvedOptions),
        isPlaceholder: false,
        placeholder: "",
        isEditable: false,
      })
      processedSegments.push(dateSegment)
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
      processedSegments.push({
        type: "literal",
        text: "\u2069",
        ...getSegmentLimits(displayValue, "literal", resolvedOptions),
        isPlaceholder: false,
        placeholder: "",
        isEditable: false,
      })
    } else {
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
