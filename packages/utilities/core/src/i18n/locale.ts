const RTL_SCRIPTS = new Set([
  "Avst",
  "Arab",
  "Armi",
  "Syrc",
  "Samr",
  "Mand",
  "Thaa",
  "Mend",
  "Nkoo",
  "Adlm",
  "Rohg",
  "Hebr",
])

const RTL_LANGS = new Set([
  "ae",
  "ar",
  "arc",
  "bcc",
  "bqi",
  "ckb",
  "dv",
  "fa",
  "glk",
  "he",
  "ku",
  "mzn",
  "nqo",
  "pnb",
  "ps",
  "sd",
  "ug",
  "ur",
  "yi",
])

export function isRTL(locale: string) {
  if (Intl.Locale) {
    try {
      const script = new Intl.Locale(locale).maximize().script ?? ""
      return RTL_SCRIPTS.has(script)
    } catch {
      // invalid tags fall through to the language list
    }
  }

  const lang = locale.split("-")[0]
  return RTL_LANGS.has(lang)
}

export function getLocaleDir(locale: string): Direction {
  return isRTL(locale) ? "rtl" : "ltr"
}

export type Direction = "rtl" | "ltr"

export interface Locale {
  locale: string
  dir: Direction
}

declare global {
  interface Navigator {
    userLanguage?: string | undefined
  }
}

export function getDefaultLocale(): Locale {
  let locale = (typeof navigator !== "undefined" && (navigator.language || navigator.userLanguage)) || "en-US"

  try {
    Intl.DateTimeFormat.supportedLocalesOf([locale])
  } catch {
    locale = "en-US"
  }

  return {
    locale,
    dir: isRTL(locale) ? "rtl" : "ltr",
  }
}
