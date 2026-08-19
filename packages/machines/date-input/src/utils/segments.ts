import { DateFormatter } from "@internationalized/date"
import type { DateGranularity } from "@zag-js/date-utils"
import type { DateSegment, EditableSegmentType, IntlTranslations, Segments } from "../date-input.types"
import type { IncompleteDate } from "./incomplete-date"

export function needsTimeGranularity(granularity: DateGranularity): boolean {
  return granularity === "hour" || granularity === "minute" || granularity === "second"
}

export interface FormatterOptions {
  granularity: DateGranularity
  digitStyle: "2-digit" | "numeric"
  hourCycle: "h12" | "h23" | undefined
  timeZone: string
  /** True when the value is a ZonedDateTime — adds the `timeZoneName` segment. */
  hasTimeZone?: boolean | undefined
  /** Hides the `timeZoneName` segment even when `hasTimeZone` is true. */
  hideTimeZone?: boolean | undefined
}

export function getFormatterOptions(opts: FormatterOptions): Intl.DateTimeFormatOptions {
  const { granularity, digitStyle, hourCycle, timeZone, hasTimeZone, hideTimeZone } = opts
  const options: Intl.DateTimeFormatOptions = {
    timeZone,
    day: digitStyle,
    month: digitStyle,
    year: "numeric",
    hourCycle,
  }
  if (needsTimeGranularity(granularity)) options.hour = digitStyle
  if (granularity === "minute" || granularity === "second") options.minute = "2-digit"
  if (granularity === "second") options.second = "2-digit"
  if (hasTimeZone && !hideTimeZone) options.timeZoneName = "short"
  return options
}

export function resolveAllSegments(formatter: DateFormatter): Segments {
  const segs = formatter
    .formatToParts(new Date())
    .filter((seg) => EDITABLE_SEGMENTS[seg.type])
    .reduce<Segments>((p, seg) => {
      const key = TYPE_MAPPING[seg.type as keyof typeof TYPE_MAPPING] || seg.type
      p[key] = true
      return p
    }, {})
  if (segs.year) segs.era = true
  return segs
}

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
} as const satisfies Record<keyof typeof EDITABLE_SEGMENTS, number | undefined>

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
  displayValue: IncompleteDate
  formatter: DateFormatter
  locale: string
  translations: IntlTranslations
  granularity: DateGranularity
}

/**
 * Calls formatter.formatToParts(dateValue), with a fallback for environments
 * where very old dates (e.g. year < 100 CE) throw RangeError in Intl.DateTimeFormat.
 */
function getSafeFormatParts(
  formatter: DateFormatter,
  dateValue: Date,
  displayValue: IncompleteDate,
): Intl.DateTimeFormatPart[] {
  try {
    return formatter.formatToParts(dateValue)
  } catch {
    // dateValue is out of the safe range for Intl.DateTimeFormat (e.g. year < 100 CE or NaN).
    // Use today's date to get the correct segment structure (guaranteed safe), then patch
    // the actual field values so the user sees what they typed.
    return formatter.formatToParts(new Date()).map((part) => {
      const type = part.type as string
      switch (type) {
        case "year":
        case "relatedYear":
          return { ...part, value: String(displayValue.year ?? 0) }
        case "month":
          return { ...part, value: String(displayValue.month ?? 0) }
        case "day":
          return { ...part, value: String(displayValue.day ?? 0) }
      }
      return part
    })
  }
}

export function processSegments({
  dateValue,
  displayValue,
  formatter,
  locale,
  translations,
  granularity,
}: ProcessSegmentsProps): DateSegment[] {
  const timeValue = ["hour", "minute", "second"]
  const segments = getSafeFormatParts(formatter, dateValue, displayValue)
  const processedSegments: DateSegment[] = []

  for (const segment of segments) {
    const type = getSafeType(segment.type)
    let isEditable = isEditableSegment(type)
    if (type === "era" && displayValue.calendar.getEras().length === 1) {
      isEditable = false
    }

    // A segment is a placeholder when the user hasn't typed a value for it yet
    // (the corresponding field in IncompleteDate is null).
    const isPlaceholder = isEditable && displayValue[type as keyof typeof displayValue] == null
    let placeholder = isEditableSegment(type) ? getPlaceholder(type, translations, locale) : null
    // For dayPeriod and era, use the formatted value from the display date to avoid layout shift
    if ((type === "dayPeriod" || type === "era") && segment.value) {
      placeholder = segment.value
    }

    const dateSegment = {
      type,
      text: isPlaceholder ? placeholder : segment.value,
      ...(displayValue.getSegmentLimits(type) ?? {}),
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
        isPlaceholder: false,
        placeholder: "",
        isEditable: false,
      })
      processedSegments.push(dateSegment)
      if (type === granularity) {
        processedSegments.push({
          type: "literal",
          text: "\u2069",
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
