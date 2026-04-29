import { DateFormatter, toCalendarDateTime, type Calendar } from "@internationalized/date"
import type { PropFn } from "@zag-js/core"
import { constrainSegments, getTodayDate } from "@zag-js/date-utils"
import type { DateGranularity } from "@zag-js/date-utils"
import type { DateInputSchema, DateValue } from "../date-input.types"
import { needsTimeGranularity } from "./segments"

export function getValueAsString(value: DateValue[], prop: PropFn<DateInputSchema>) {
  return value.map((date) => {
    if (date == null) return ""
    try {
      return prop("format")(date, { locale: prop("locale"), timeZone: prop("timeZone") })
    } catch {
      return ""
    }
  })
}

export function constrainValues(values: DateValue[] | undefined, min?: DateValue, max?: DateValue) {
  return values?.map((date) => constrainSegments(date, min, max))
}

export function resolveHourCycleProp(hourCycle?: 12 | 24): "h12" | "h23" | undefined {
  if (hourCycle === 12) return "h12"
  if (hourCycle === 24) return "h23"
}

export interface PlaceholderOptions {
  placeholderValue?: DateValue | undefined
  defaultPlaceholderValue?: DateValue | undefined
  min?: DateValue | undefined
  max?: DateValue | undefined
}

export function resolvePlaceholderValue(
  options: PlaceholderOptions,
  timeZone: string,
  granularity: DateGranularity,
  value?: DateValue[],
  defaultValue?: DateValue[],
  calendar?: Calendar,
): DateValue {
  let placeholder =
    options.placeholderValue ||
    options.defaultPlaceholderValue ||
    value?.[0] ||
    defaultValue?.[0] ||
    getTodayDate(timeZone, calendar)
  placeholder = constrainSegments(placeholder, options.min, options.max)
  if (needsTimeGranularity(granularity) && !("hour" in placeholder)) {
    placeholder = toCalendarDateTime(placeholder)
  }
  return placeholder
}

export function createFormatFn(formatter: DateFormatter) {
  return (date: DateValue, { timeZone }: { timeZone: string }) => {
    const jsd = date.toDate(timeZone)
    const isBC = date.calendar?.identifier === "gregory" && date.era === "BC"
    if (isBC) {
      const prolYear = jsd.getUTCFullYear()
      const safeDate = new Date(Date.UTC(2000, jsd.getUTCMonth(), jsd.getUTCDate()))
      return formatter
        .formatToParts(safeDate)
        .map((p) => (p.type === "year" ? String(prolYear) : p.value))
        .join("")
    }
    return formatter.format(jsd)
  }
}
