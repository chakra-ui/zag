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
    const script = new Intl.Locale(locale).maximize().script ?? ""
    return RTL_SCRIPTS.has(script)
  }

  const lang = locale.split("-")[0]
  return RTL_LANGS.has(lang)
}

export function getLocaleDir(locale: string) {
  return isRTL(locale) ? "rtl" : "ltr"
}
