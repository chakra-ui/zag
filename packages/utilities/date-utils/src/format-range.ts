import type { DateValue, DateFormatter } from "@internationalized/date"

export function formatRange(
  startDate: DateValue,
  endDate: DateValue,
  formatter: DateFormatter,
  toString: (start: string, end: string) => string,
  timeZone: string,
) {
  let parts = formatter.formatRangeToParts(startDate.toDate(timeZone), endDate.toDate(timeZone))

  let separatorIndex = -1

  for (let i = 0; i < parts.length; i++) {
    let part = parts[i]
    if (part.source === "shared" && part.type === "literal") {
      separatorIndex = i
    } else if (part.source === "endRange") {
      break
    }
  }

  let start = ""
  let end = ""

  for (let i = 0; i < parts.length; i++) {
    if (i < separatorIndex) {
      start += parts[i].value
    } else if (i > separatorIndex) {
      end += parts[i].value
    }
  }

  return toString(start, end)
}
