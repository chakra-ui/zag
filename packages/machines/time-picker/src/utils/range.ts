import { stringToTime, timeToString } from "./conversion"
import { getHourFormat } from "./hour-format"

export function getTimeRange(
  from: string | null,
  to: string | null,
  interval: string | null,
  locale: string,
): string[] {
  const range: string[] = []

  const fromTime = from ? stringToTime(from, locale) : null
  const toTime = to ? stringToTime(to, locale) : null
  const intervalTime = interval ? stringToTime(interval, locale) : null

  if (!fromTime || !toTime || !intervalTime) return range
  let current = fromTime

  while (current.compare(toTime) <= 0) {
    range.push(timeToString(current, locale))
    current = current.add({
      hours: intervalTime.hour,
      minutes: intervalTime.minute,
      seconds: intervalTime.second,
    })
  }
  return range
}

export function getHours(locale: string, step: number | undefined): number[] {
  const format = getHourFormat(locale)
  const hours = format.getValidHours()
  if (step == null) return hours
  return hours.filter((hour) => hour % step === 0)
}

export function getMinutes(step: number | undefined): number[] {
  const minutes = Array.from({ length: 60 }, (_, i) => i)
  if (step == null) return minutes
  return minutes.filter((minute) => minute % step === 0)
}

export function getSeconds(step: number | undefined): number[] {
  const seconds = Array.from({ length: 60 }, (_, i) => i)
  if (step == null) return seconds
  return seconds.filter((second) => second % step === 0)
}
