import type { CalendarDate, DateDuration } from "@internationalized/date"

export function getUnitDuration(duration: DateDuration) {
  let d = { ...duration }
  for (let key in d) {
    d[key] = 1
  }
  return d
}

export function getEndDate(startDate: CalendarDate, duration: DateDuration) {
  let d = { ...duration }
  if (d.days) {
    d.days--
  } else {
    d.days = -1
  }
  return startDate.add(d)
}
