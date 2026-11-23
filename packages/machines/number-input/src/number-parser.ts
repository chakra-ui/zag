interface Symbols {
  minus: string
  plus: string | undefined
  decimal: string | undefined
  group: string | undefined
  /** Text that carries no value: currency, percent and unit signs, spaces and format characters */
  literals: RegExp
  /** The locale's digits, mapped to 0-9 */
  digits: Map<string, string>
  digit: RegExp
  /** Units some locales write as a word alone, like "يومان" for 2 days */
  words: Map<string, number>
  options: Intl.ResolvedNumberFormatOptions
}

// Numbering systems a typed value may use besides the locale's own
const NUMBERING_SYSTEMS = ["latn", "arab", "arabext", "hanidec", "deva", "beng", "fullwide"]
const VALUE_PARTS = new Set(["decimal", "fraction", "integer", "minusSign", "plusSign", "group"])
const PLURAL_SAMPLES = [0, 4, 2, 1, 11, 20, 3, 7, 100, 21, 0.1, 1.1]

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const cache = new Map<string, Symbols>()

// Learns what a locale's formatted numbers are made of, from Intl itself
function getSymbols(locale: string, options: Intl.NumberFormatOptions): Symbols {
  const key = locale + JSON.stringify(options)
  let symbols = cache.get(key)
  if (symbols) return symbols

  const resolved = new Intl.NumberFormat(locale, options).resolvedOptions()
  const full = new Intl.NumberFormat(locale, {
    ...resolved,
    minimumSignificantDigits: 1,
    maximumSignificantDigits: 21,
    roundingIncrement: 1,
    roundingPriority: "auto",
    roundingMode: "halfExpand",
    useGrouping: true,
  } as Intl.NumberFormatOptions)

  // Some locales only group from the ten thousands
  const negative = full.formatToParts(-10000.111)
  const positive = full.formatToParts(10000.111)
  const plurals = PLURAL_SAMPLES.map((n) => full.formatToParts(n))
  const find = (parts: Intl.NumberFormatPart[], type: string) => parts.find((p) => p.type === type)?.value

  const words = new Map<string, number>()
  plurals.forEach((parts, i) => {
    const unit = find(parts, "unit")
    if (unit && !parts.some((p) => p.type === "integer" || p.type === "fraction")) words.set(unit, PLURAL_SAMPLES[i])
  })

  let plus = find(positive, "plusSign")
  if (!plus && (options.signDisplay === "exceptZero" || options.signDisplay === "always")) plus = "+"

  // Percent and one significant digit show no decimals, so read it from a format that does
  const decimal = find(
    new Intl.NumberFormat(locale, { ...resolved, minimumFractionDigits: 2, maximumFractionDigits: 2 }).formatToParts(
      0.001,
    ),
    "decimal",
  )

  const literals = [
    ...new Set([...negative, ...plurals.flat()].filter((p) => !VALUE_PARTS.has(p.type)).map((p) => escape(p.value))),
  ].sort((a, b) => b.length - a.length)
  literals.push("\\p{White_Space}", "\\p{Cf}")

  const numerals = [...new Intl.NumberFormat(resolved.locale, { useGrouping: false }).format(9876543210)].reverse()

  symbols = {
    minus: find(negative, "minusSign") ?? "-",
    plus,
    decimal,
    group: find(negative, "group"),
    literals: new RegExp(literals.join("|"), "gu"),
    digits: new Map(numerals.map((d, i) => [d, String(i)])),
    digit: new RegExp(`[${numerals.join("")}]`, "g"),
    words,
    options: resolved,
  }
  cache.set(key, symbols)
  return symbols
}

function sanitize(value: string, s: Symbols): string {
  const word = s.words.get(value)
  if (word != null) return String(word)

  value = value.replace(s.literals, "").replaceAll("-", s.minus)
  const grouping = s.options.useGrouping
  if (s.options.numberingSystem === "arab" && s.decimal) {
    // Arabic text is typed with either the Arabic or the Latin separators
    value = value.replaceAll(",", s.decimal).replaceAll("،", s.decimal)
    if (s.group && grouping) value = value.replaceAll(".", s.group)
  }
  // Swiss grouping is written with either apostrophe
  if (s.group && grouping && (s.group === "'" || s.group === "’")) value = value.replace(/['’]/g, s.group)
  return value
}

function isPartial(value: string, s: Symbols, min = -Infinity, max = Infinity): boolean {
  value = sanitize(value, s)
  if (value.startsWith(s.minus) && min < 0) value = value.slice(s.minus.length)
  else if (s.plus && value.startsWith(s.plus) && max > 0) value = value.slice(s.plus.length)
  if (s.decimal && value.includes(s.decimal) && s.options.maximumFractionDigits === 0) return false
  if (s.group && s.options.useGrouping) value = value.replaceAll(s.group, "")
  value = value.replace(s.digit, "")
  if (s.decimal) value = value.replace(s.decimal, "")
  return value.length === 0
}

function parse(text: string, s: Symbols): number {
  let value = sanitize(text, s)
  if (s.group) {
    if (!s.options.useGrouping && value.includes(s.group)) return Number.NaN
    value = value.replaceAll(s.group, "")
  }
  if (s.decimal) value = value.replace(s.decimal, ".")
  value = value.replace(s.minus, "-").replace(s.digit, (d) => s.digits.get(d)!)

  const { style, currencySign, maximumFractionDigits = 0 } = s.options
  if (style === "percent") {
    // Shift the decimal point in the text, so 1.1% reads as 0.011 without float noise
    const negative = value.includes("-")
    value = value.replace("-", "").replace("+", "")
    const [int = "", frac = "", extra] = value.split(".")
    if ((!int && !frac) || extra != null) return Number.NaN
    value = `${negative ? "-" : ""}${int.slice(0, -2) || "0"}.${int.slice(-2).padStart(2, "0")}${frac}`
    const n = Number(value)
    return Number.isNaN(n) ? n : roundHalfExpand(n, Math.min(maximumFractionDigits + 2, 20))
  }

  const n = value ? Number(value) : Number.NaN
  if (Number.isNaN(n)) return n
  return currencySign === "accounting" && /\(.*\)/.test(text) ? -n : n
}

const rounders = new Map<number, Intl.NumberFormat>()

// Rounds the way Intl does, so a parsed percent matches what it shows
function roundHalfExpand(n: number, decimals: number) {
  let fmt = rounders.get(decimals)
  if (!fmt)
    rounders.set(
      decimals,
      (fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: decimals, useGrouping: false })),
    )
  return Number(fmt.format(n))
}

/** Reads numbers typed in a locale's format, in its own digits or a few common others */
export function createNumberParser(locale: string, options: Intl.NumberFormatOptions = {}) {
  const symbolsFor = (value: string) => {
    const s = getSymbols(locale, options)
    if (locale.includes("-nu-") || isPartial(value, s)) return s
    for (const system of NUMBERING_SYSTEMS) {
      if (system === s.options.numberingSystem) continue
      const other = getSymbols(locale + (locale.includes("-u-") ? "-nu-" : "-u-nu-") + system, options)
      if (isPartial(value, other)) return other
    }
    return s
  }
  return {
    parse: (value: string) => parse(value, symbolsFor(value)),
    isValidPartialNumber: (value: string, min?: number, max?: number) => isPartial(value, symbolsFor(value), min, max),
  }
}

export type NumberParser = ReturnType<typeof createNumberParser>
