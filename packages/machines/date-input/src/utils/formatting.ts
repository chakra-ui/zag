import type { PropFn } from "@zag-js/core"
import type { DateInputSchema, DateValue } from "../date-input.types"

export function getValueAsString(value: DateValue[], prop: PropFn<DateInputSchema>) {
  return value.map((date) => {
    if (date == null) return ""
    // Guard against RangeError thrown by Intl.DateTimeFormat.format() for edge-case dates
    // (e.g. year < 100 CE) that some ICU/V8 versions reject as out-of-range.
    // This can occur while the user is mid-edit and an intermediate date with a very small
    // year is briefly stored in `value` before the segment is fully cleared.
    try {
      return prop("format")(date, { locale: prop("locale"), timeZone: prop("timeZone") })
    } catch {
      return ""
    }
  })
}
