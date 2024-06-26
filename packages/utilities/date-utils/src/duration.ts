import type { DateDuration, DateValue } from "@internationalized/date"

export function getUnitDuration(duration: DateDuration) {
  let clone = { ...duration }

  for (let key in clone) {
    clone[key as keyof typeof clone] = 1
  }

  return clone
}

export function getEndDate(startDate: DateValue, duration: DateDuration) {
  let clone = { ...duration }

  if (clone.days) {
    clone.days--
  } else {
    clone.days = -1
  }

  return startDate.add(clone)
}
