import type { IntlTranslations } from "../date-input.types"

// Locale-aware placeholders for date segments
// Adapted from reka-ui / melt-ui (MIT license)
type LocalePlaceholder = readonly [year: string, month: string, day: string]

const LOCALE_PLACEHOLDERS: Record<string, LocalePlaceholder> = {
  ach: ["mwaka", "dwe", "nino"],
  af: ["jjjj", "mm", "dd"],
  am: ["ዓዓዓዓ", "ሚሜ", "ቀቀ"],
  an: ["aaaa", "mm", "dd"],
  ar: ["سنة", "شهر", "يوم"],
  ast: ["aaaa", "mm", "dd"],
  az: ["iiii", "aa", "gg"],
  be: ["гггг", "мм", "дд"],
  bg: ["гггг", "мм", "дд"],
  bn: ["yyyy", "মিমি", "dd"],
  br: ["bbbb", "mm", "dd"],
  bs: ["gggg", "mm", "dd"],
  ca: ["aaaa", "mm", "dd"],
  cak: ["jjjj", "ii", "q'q'"],
  ckb: ["ساڵ", "مانگ", "ڕۆژ"],
  cs: ["rrrr", "mm", "dd"],
  cy: ["bbbb", "mm", "dd"],
  da: ["åååå", "mm", "dd"],
  de: ["jjjj", "mm", "tt"],
  dsb: ["llll", "mm", "źź"],
  el: ["εεεε", "μμ", "ηη"],
  en: ["yyyy", "mm", "dd"],
  eo: ["jjjj", "mm", "tt"],
  es: ["aaaa", "mm", "dd"],
  et: ["aaaa", "kk", "pp"],
  eu: ["uuuu", "hh", "ee"],
  fa: ["سال", "ماه", "روز"],
  ff: ["hhhh", "ll", "ññ"],
  fi: ["vvvv", "kk", "pp"],
  fr: ["aaaa", "mm", "jj"],
  fy: ["jjjj", "mm", "dd"],
  ga: ["bbbb", "mm", "ll"],
  gd: ["bbbb", "mm", "ll"],
  gl: ["aaaa", "mm", "dd"],
  he: ["שנה", "חודש", "יום"],
  hr: ["gggg", "mm", "dd"],
  hsb: ["llll", "mm", "dd"],
  hu: ["éééé", "hh", "nn"],
  ia: ["aaaa", "mm", "dd"],
  id: ["tttt", "bb", "hh"],
  it: ["aaaa", "mm", "gg"],
  ja: ["年", "月", "日"],
  ka: ["წწწწ", "თთ", "რრ"],
  kk: ["жжжж", "аа", "кк"],
  kn: ["ವವವವ", "ಮಿಮೀ", "ದಿದಿ"],
  ko: ["연도", "월", "일"],
  lb: ["jjjj", "mm", "dd"],
  lo: ["ປປປປ", "ດດ", "ວວ"],
  lt: ["mmmm", "mm", "dd"],
  lv: ["gggg", "mm", "dd"],
  meh: ["aaaa", "mm", "dd"],
  ml: ["വർഷം", "മാസം", "തീയതി"],
  ms: ["tttt", "mm", "hh"],
  nl: ["jjjj", "mm", "dd"],
  nn: ["åååå", "mm", "dd"],
  no: ["åååå", "mm", "dd"],
  oc: ["aaaa", "mm", "jj"],
  pl: ["rrrr", "mm", "dd"],
  pt: ["aaaa", "mm", "dd"],
  rm: ["oooo", "mm", "dd"],
  ro: ["aaaa", "ll", "zz"],
  ru: ["гггг", "мм", "дд"],
  sc: ["aaaa", "mm", "dd"],
  scn: ["aaaa", "mm", "jj"],
  sk: ["rrrr", "mm", "dd"],
  sl: ["llll", "mm", "dd"],
  sr: ["гггг", "мм", "дд"],
  sv: ["åååå", "mm", "dd"],
  szl: ["rrrr", "mm", "dd"],
  tg: ["сссс", "мм", "рр"],
  th: ["ปปปป", "ดด", "วว"],
  tr: ["yyyy", "aa", "gg"],
  uk: ["рррр", "мм", "дд"],
  "sr-Latn": ["gggg", "mm", "dd"],
  "zh-CN": ["年", "月", "日"],
  "zh-TW": ["年", "月", "日"],
}

function getLocaleLanguage(locale: string): string {
  if (typeof Intl !== "undefined" && Intl.Locale) {
    return new Intl.Locale(locale).language
  }
  return locale.split("-")[0]
}

function getLocaleScript(locale: string): string | undefined {
  if (typeof Intl !== "undefined" && Intl.Locale) {
    return new Intl.Locale(locale).script || undefined
  }

  const script = locale.split("-").find((part) => part.length === 4)
  if (!script) return undefined

  return script.charAt(0).toUpperCase() + script.slice(1).toLowerCase()
}

function getLocalePlaceholders(locale: string): LocalePlaceholder {
  const exact = LOCALE_PLACEHOLDERS[locale]
  if (exact) return exact

  const lang = getLocaleLanguage(locale)

  const script = getLocaleScript(locale)
  if (script) {
    const langScript = `${lang}-${script}`
    const langScriptPlaceholder = LOCALE_PLACEHOLDERS[langScript]
    if (langScriptPlaceholder) return langScriptPlaceholder
  }

  return LOCALE_PLACEHOLDERS[lang] || LOCALE_PLACEHOLDERS.en
}

export const defaultTranslations: IntlTranslations = {
  placeholder(locale) {
    const [year, month, day] = getLocalePlaceholders(locale)
    return {
      day,
      month,
      year,
      hour: "––",
      minute: "––",
      second: "––",
      dayPeriod: "AM/PM",
      era: "era",
      timeZoneName: "timeZone",
      weekday: "weekday",
      unknown: "unknown",
      fractionalSecond: "ff",
    }
  },
}
