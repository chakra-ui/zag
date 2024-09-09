import { isRTL } from "./is-rtl"

export type Direction = "rtl" | "ltr"

export interface Locale {
  locale: string
  dir: Direction
}

declare global {
  interface Navigator {
    userLanguage?: string
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
