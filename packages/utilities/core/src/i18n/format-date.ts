import { cached } from "./cache"

const getDateFormat = /*#__PURE__*/ cached<Intl.DateTimeFormatOptions, typeof Intl.DateTimeFormat>(Intl.DateTimeFormat)

const TOKEN_SEPARATOR = "[\\s.\\-/\\\\,$!?:;<>]"

// a run of one pattern letter, optionally ordinal ("Do"), between separators
const DATE_TOKEN = /*#__PURE__*/ new RegExp(
  `(?<=^|${TOKEN_SEPARATOR})([GyYQMEadDwsmhHzT])\\1*o?(?=$|${TOKEN_SEPARATOR})`,
  "g",
)

function ordinal(n: number) {
  let suffix = "th"
  if (n % 10 === 1 && n % 100 !== 11) suffix = "st"
  else if (n % 10 === 2 && n % 100 !== 12) suffix = "nd"
  else if (n % 10 === 3 && n % 100 !== 13) suffix = "rd"
  return `${n}${suffix}`
}

const pad = (n: number, length: number) => String(n).padStart(length, "0")

function formatToken(date: Date, token: string, locale: string, timeZone?: string): string | number | undefined {
  const part = (type: Intl.DateTimeFormatPartTypes, options: Intl.DateTimeFormatOptions) =>
    getDateFormat(locale, options)
      .formatToParts(date)
      .find((p: Intl.DateTimeFormatPart) => p.type === type)?.value ?? ""

  const quarter = Math.ceil((date.getMonth() + 1) / 3)
  const week = Math.ceil(date.getDate() / 7)
  const hour12 = date.getHours() % 12 || 12

  switch (token) {
    // era
    case "G":
    case "GG":
    case "GGG":
      return part("era", { era: "short" })
    case "GGGG":
      return part("era", { era: "long" })
    case "GGGGG":
      return part("era", { era: "narrow" })

    // year
    case "y":
    case "Y":
      return date.getFullYear()
    case "yo":
    case "Yo":
      return ordinal(date.getFullYear())
    case "yy":
    case "YY":
      return pad(date.getFullYear() % 100, 2)
    case "yyy":
    case "YYY":
      return pad(date.getFullYear(), 3)
    case "yyyy":
    case "YYYY":
      return pad(date.getFullYear(), 4)

    // quarter
    case "Q":
    case "QQQQQ":
      return quarter
    case "Qo":
      return ordinal(quarter)
    case "QQ":
      return pad(quarter, 2)
    case "QQQ":
      return `Q${quarter}`
    case "QQQQ":
      return `${ordinal(quarter)} quarter`

    // month
    case "M":
      return date.getMonth() + 1
    case "Mo":
      return ordinal(date.getMonth() + 1)
    case "MM":
      return pad(date.getMonth() + 1, 2)
    case "MMM":
      return part("month", { month: "short" })
    case "MMMM":
      return part("month", { month: "long" })
    case "MMMMM":
      return part("month", { month: "narrow" })

    // week of month
    case "w":
      return week
    case "wo":
      return ordinal(week)
    case "ww":
      return pad(week, 2)

    // day
    case "d":
    case "D":
      return date.getDate()
    case "do":
    case "Do":
      return ordinal(date.getDate())
    case "dd":
    case "DD":
      return pad(date.getDate(), 2)
    case "DDD":
      return pad(date.getDate(), 3)

    // weekday
    case "E":
    case "EE":
    case "EEE":
      return part("weekday", { weekday: "short" })
    case "EEEE":
      return part("weekday", { weekday: "long" })
    case "EEEEE":
      return part("weekday", { weekday: "narrow" })
    case "EEEEEE":
      return part("weekday", { weekday: "short" }).slice(0, 2)

    // hour
    case "h":
      return hour12
    case "ho":
      return ordinal(hour12)
    case "hh":
      return pad(hour12, 2)
    case "H":
      return date.getHours()
    case "Ho":
      return ordinal(date.getHours())
    case "HH":
      return pad(date.getHours(), 2)

    // minute
    case "m":
      return date.getMinutes()
    case "mo":
      return ordinal(date.getMinutes())
    case "mm":
      return pad(date.getMinutes(), 2)

    // second
    case "s":
      return date.getSeconds()
    case "so":
      return ordinal(date.getSeconds())
    case "ss":
      return pad(date.getSeconds(), 2)

    // timestamp
    case "T":
      return date.getTime()

    // day period
    case "a":
    case "aa":
    case "aaa":
      return part("dayPeriod", { hour: "numeric", hourCycle: "h12" }).toLocaleUpperCase(locale)
    case "aaaa":
      return part("dayPeriod", { hour: "numeric", hourCycle: "h12" }).toLocaleLowerCase(locale)
    case "aaaaa":
      return part("dayPeriod", { hour: "numeric", hourCycle: "h12" }).charAt(0)

    // time zone
    case "z":
    case "zz":
    case "zzz":
      return part("timeZoneName", { timeZoneName: "shortOffset", timeZone })
    case "zzzz":
      return part("timeZoneName", { timeZoneName: "longOffset", timeZone })
  }
}

/**
 * Formats a date with a pattern of field symbols, like `"yyyy-MM-dd"`. Unknown symbols are kept as written.
 * @see https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 */
export function formatDate(date: Date, format: string, locale: string, timeZone?: string): string {
  return format.replace(DATE_TOKEN, (token) => String(formatToken(date, token, locale, timeZone) ?? token))
}
