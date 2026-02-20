import type { PropFn } from "@zag-js/core"
import type { DateFieldSchema, DateValue } from "../date-field.types"

export function getValueAsString(value: DateValue[], prop: PropFn<DateFieldSchema>) {
  return value.map((date) => {
    if (date == null) return ""
    return prop("format")(date, { locale: prop("locale"), timeZone: prop("timeZone") })
  })
}
