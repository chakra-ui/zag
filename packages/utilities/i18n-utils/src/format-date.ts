const symbols = "\\s|\\.|-|/|\\\\|,|\\$|\\!|\\?|:|;"

function createRegEx(sign: string) {
  return new RegExp("(^|>|" + symbols + ")(" + sign + ")($|<|" + symbols + ")", "g")
}

// prettier-ignore
const FORMATS = [
"G","GG","GGG","GGGG","GGGGG",
"y","yo","yy","yyy","yyyy",
"Y","Yo","YY","YYY","YYYY",
"Q","Qo","QQ","QQQ","QQQQ","QQQQQ",
"M","Mo","MM","MMM","MMMM","MMMMM",
"E","EE","EEE","EEEE","EEEEE","EEEEEE",
"a","aa","aaa","aaaa","aaaaa",
"d","do","dd",
"D","Do","DD","DDD",
"w","wo","ww",
"s","so","ss",
"m","mo","mm",
"h","ho","hh",
"H","Ho","HH",
"z","zz","zzz","zzzz",
"T",
] as const

type Format = (typeof FORMATS)[number]

interface FormatDateOptions {
  locale: string
  format: Format
  timeZone?: string | undefined
}

function ordinal(num: string | number) {
  const n = typeof num === "string" ? parseFloat(num) : num
  let suffix = "th"
  if (n % 10 === 1 && n % 100 !== 11) {
    suffix = "st"
  } else if (n % 10 === 2 && n % 100 !== 12) {
    suffix = "nd"
  } else if (n % 10 === 3 && n % 100 !== 13) {
    suffix = "rd"
  }
  return `${n}${suffix}`
}

function pad(num: number, length: number) {
  return String(num).padStart(length, "0")
}

function zone(str: string) {
  return str.split(/AM|PM/)[1].trim()
}

function getFormat(date: Date, options: FormatDateOptions) {
  const { locale, format, timeZone } = options

  switch (format) {
    // era
    case "G":
    case "GG":
    case "GGG":
      return date.toLocaleString(locale, { era: "short" })
    case "GGGG":
      return date.toLocaleString(locale, { era: "long" })
    case "GGGGG":
      return date.toLocaleString(locale, { era: "narrow" })

    // year
    case "y":
    case "Y":
      return date.getFullYear()
    case "yo":
    case "Yo":
      return ordinal(date.toLocaleString(locale, { year: "numeric" }))
    case "yy":
    case "YY":
      return date.toLocaleString(locale, { year: "2-digit" })
    case "yyy":
    case "YYY":
      return date.toLocaleString(locale, { year: "numeric" }).padStart(3, "0")
    case "yyyy":
    case "YYYY":
      return date.toLocaleString(locale, { year: "numeric" }).padStart(4, "0")

    // quarter
    case "Q":
    case "QQQQQ":
      return Math.ceil((date.getMonth() + 1) / 3)
    case "Qo":
      return ordinal(Math.ceil((date.getMonth() + 1) / 3))
    case "QQ":
      return pad(Math.ceil((date.getMonth() + 1) / 3), 2)
    case "QQQ":
      return `Q${Math.ceil((date.getMonth() + 1) / 3)}`
    case "QQQQ": {
      const base = ordinal(String(Math.ceil((date.getMonth() + 1) / 3)))
      return `${base} quarter`
    }

    // month
    case "M":
      return date.getMonth() + 1
    case "Mo":
      return ordinal(date.getMonth() + 1)
    case "MM":
      return date.toLocaleString(locale, { month: "2-digit" })
    case "MMM":
      return date.toLocaleString(locale, { month: "short" })
    case "MMMM":
      return date.toLocaleString(locale, { month: "long" })
    case "MMMMM":
      return date.toLocaleString(locale, { month: "narrow" })

    // week
    case "w":
      return Math.ceil(date.getDate() / 7)
    case "wo":
      return ordinal(Math.ceil(date.getDate() / 7))
    case "ww":
      return pad(Math.ceil(date.getDate() / 7), 2)

    // day
    case "d":
    case "D":
      return date.getDate()
    case "do":
    case "Do":
      return ordinal(date.getDate())
    case "dd":
    case "DD":
      return date.toLocaleString(locale, { day: "2-digit" })
    case "DDD":
      return pad(date.getDate(), 3)

    // weekday
    case "E":
    case "EE":
    case "EEE":
      return date.toLocaleString(locale, { weekday: "short" })
    case "EEEE":
      return date.toLocaleString(locale, { weekday: "long" })
    case "EEEEE":
      return date.toLocaleString(locale, { weekday: "narrow" })
    case "EEEEEE":
      return date.toLocaleString(locale, { weekday: "short" }).slice(0, 2)

    // hour
    case "h":
      return date.toLocaleString(locale, { hour: "numeric", hour12: true })
    case "ho":
      return ordinal(date.toLocaleString(locale, { hour: "2-digit", hour12: true }))
    case "hh":
      return date.toLocaleString(locale, { hour: "2-digit", hour12: true })
    case "H":
      return date.toLocaleString(locale, { hour: "numeric", hour12: false })
    case "Ho":
      return ordinal(+date.toLocaleString(locale, { hour: "numeric", hour12: false }))
    case "HH":
      return date.toLocaleString(locale, { hour: "2-digit", hour12: false })

    // minute
    case "m":
      return date.toLocaleString(locale, { minute: "numeric" })
    case "mo":
      return ordinal(date.toLocaleString(locale, { minute: "numeric" }))
    case "mm":
      return date.toLocaleString(locale, { minute: "2-digit" })

    // second
    case "s":
      return date.toLocaleString(locale, { second: "numeric" })
    case "so":
      return ordinal(date.toLocaleString(locale, { second: "numeric" }))
    case "ss":
      return date.toLocaleString(locale, { second: "2-digit" })

    // timestamp
    case "T":
      return date.getTime()

    // day period
    case "a":
    case "aa":
    case "aaa":
      return date.toLocaleString(locale, { hour: "numeric", hour12: true }).toLocaleUpperCase()
    case "aaaa":
      return date.toLocaleString(locale, { hour: "numeric", hour12: true }).toLocaleLowerCase()
    case "aaaaa":
      return date.toLocaleString(locale, { hour: "numeric", hour12: true }).charAt(0)

    // TODO:Revise this
    case "z":
    case "zz":
    case "zzz": {
      return zone(date.toLocaleString(locale, { timeZone, timeZoneName: "shortOffset" }))
    }
    case "zzzz":
      return zone(date.toLocaleString(locale, { timeZone, timeZoneName: "longOffset" }))

    default:
      throw new Error(`Unknown format: ${format}`)
  }
}

/**
 * Formats a date using the given format string as defined in:
 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 */
export function formatDate(date: Date, format: string, locale: string, timeZone?: string) {
  let result = format
  for (const key of FORMATS) {
    const res = getFormat(date, { locale, format: key, timeZone })
    result = result.replace(createRegEx(key), "$1" + res + "$3")
  }
  return result
}
