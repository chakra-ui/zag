import type { PropFn } from "@zag-js/core"
import type { DateInputSchema, DateValue } from "../date-input.types"

export function getValueAsString(value: DateValue[], prop: PropFn<DateInputSchema>) {
  return value.map((date) => {
    if (date == null) return ""
    return prop("format")(date, { locale: prop("locale"), timeZone: prop("timeZone") })
  })
}
