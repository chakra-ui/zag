import { CalendarDateTime, DateFormatter } from "@internationalized/date"

export function parseDateString(date: string, locale: string, timeZone: string) {
  const regex = createRegex(locale, timeZone)
  const { year, month, day } = extract(regex, date) ?? {}

  if (year != null && year.length === 4 && month != null && +month <= 12 && day != null && +day <= 31) {
    return new CalendarDateTime(+year, +month, +day)
  }

  const time = Date.parse(date)
  if (!isNaN(time)) {
    const date = new Date(time)
    return new CalendarDateTime(date.getFullYear(), date.getMonth() + 1, date.getDate())
  }
}

function createRegex(locale: string, timeZone: string) {
  const formatter = new DateFormatter(locale, { day: "numeric", month: "numeric", year: "numeric", timeZone })
  const parts = formatter.formatToParts(new Date(2000, 11, 25))
  return parts.map(({ type, value }) => (type === "literal" ? value : `((?!=<${type}>)\\d+)`)).join("")
}

function extract(pattern: string | RegExp, str: string) {
  const matches = str.match(pattern)
  return pattern
    .toString()
    .match(/<(.+?)>/g)
    ?.map((group) => {
      const groupMatches = group.match(/<(.+)>/)
      if (!groupMatches || groupMatches.length <= 0) {
        return null
      }
      return group.match(/<(.+)>/)?.[1]
    })
    .reduce(
      (acc, curr, index) => {
        if (!curr) return acc
        if (matches && matches.length > index) {
          acc[curr] = matches[index + 1]
        } else {
          acc[curr] = null
        }
        return acc
      },
      {} as { year: string; month: string; day: string },
    )
}
