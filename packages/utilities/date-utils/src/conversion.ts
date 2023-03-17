import { parseDate } from "@internationalized/date"

export function parseDateString(value: string) {
  try {
    const date = new Date(value)
    date.setMinutes(1000)

    if (isNaN(date.getTime())) return

    const [dateWithoutTime] = date.toISOString().split("T")
    return parseDate(dateWithoutTime)
  } catch {}
}
