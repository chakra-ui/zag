import { type DateValue, toCalendarDateTime } from "@internationalized/date"

function createRegEx(sign: string) {
  let symbols = "\\s|\\.|-|/|\\\\|,|\\$|\\!|\\?|:|;"
  return new RegExp("(^|>|" + symbols + ")(" + sign + ")($|<|" + symbols + ")", "g")
}

/**
 * Formats a date using the given format string as defined in:
 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 */
export function formatDate(value: DateValue, formatString: string, locale: string, timeZone: string = "UTC") {
  const datetime = toCalendarDateTime(value)
  const date = datetime.toDate(timeZone)

  const formats = {
    // Time in ms
    T: date.getTime(),

    // Minutes
    m: date.toLocaleString(locale, { minute: "numeric" }),
    mm: date.toLocaleString(locale, { minute: "2-digit" }),

    // Seconds
    s: date.toLocaleString(locale, { second: "numeric" }),
    ss: date.toLocaleString(locale, { second: "2-digit" }),

    // Hours
    h: date.toLocaleString(locale, { hour: "numeric", hour12: true }),
    hh: date.toLocaleString(locale, { hour: "2-digit", hour12: true }),
    H: date.toLocaleString(locale, { hour: "numeric", hour12: false }),
    HH: date.toLocaleString(locale, { hour: "2-digit", hour12: false }),

    // Day period
    aa: date.toLocaleString(locale, { hour: "numeric", hour12: true }).toLowerCase(),
    AA: date.toLocaleString(locale, { hour: "numeric", hour12: true }).toUpperCase(),

    // Day of week
    E: date.toLocaleString(locale, { weekday: "short" }),
    EE: date.toLocaleString(locale, { weekday: "short" }),
    EEE: date.toLocaleString(locale, { weekday: "short" }),
    EEEE: date.toLocaleString(locale, { weekday: "long" }),

    // Date of month
    d: datetime.day,
    dd: date.toLocaleString(locale, { day: "2-digit" }),

    // Months
    M: datetime.month + 1,
    MM: date.toLocaleString(locale, { month: "2-digit" }),
    MMM: date.toLocaleString(locale, { month: "short" }),
    MMMM: date.toLocaleString(locale, { month: "long" }),

    // Years
    yy: date.toLocaleString(locale, { year: "2-digit" }),
    yyyy: date.toLocaleString(locale, { year: "numeric" }),
    YY: date.toLocaleString(locale, { year: "2-digit" }),
    YYYY: date.toLocaleString(locale, { year: "numeric" }),
  }

  let result = formatString
  for (const key in formats) {
    result = result.replace(createRegEx(key), "$1" + formats[key] + "$3")
  }

  return result
}
