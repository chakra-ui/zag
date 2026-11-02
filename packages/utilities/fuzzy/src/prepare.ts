import type { PreparedQuery, PreparedTarget, PreparedText } from "./types"

// Scoring adapted from fzy (MIT, John Hawthorn)
export const MATCH_SLASH = 0.9
export const MATCH_WORD = 0.8
export const MATCH_CAPITAL = 0.7
export const MATCH_DOT = 0.6

export const MAX_LENGTH = 256

const DIACRITICS = /[̀-ͯ]/g

export const WHITESPACE = /\s+/

export const stripDiacritics = (value: string) => value.normalize("NFD").replace(DIACRITICS, "")

const normalize = (value: string) => stripDiacritics(value).slice(0, MAX_LENGTH)

// one bit per ascii letter, one for all digits
const charMask = (code: number) => {
  if (code >= 97 && code <= 122) return 1 << (code - 97)
  if (code >= 48 && code <= 57) return 1 << 26
  return 0
}

// per character, so the length never changes (e.g. "İ" lowercases to two characters)
const toLower = (code: number) => {
  if (code >= 65 && code <= 90) return code + 32
  if (code < 128) return code
  return String.fromCharCode(code).toLowerCase().charCodeAt(0)
}

const LETTER_OR_DIGIT = /[\p{L}\p{N}]/u

// a letter or digit that isn't uppercase, in any script
const isLower = (code: number) => {
  if (code < 128) return (code >= 97 && code <= 122) || (code >= 48 && code <= 57)
  const char = String.fromCharCode(code)
  return LETTER_OR_DIGIT.test(char) && char === char.toLowerCase()
}

const isUpper = (code: number) => {
  if (code < 128) return code >= 65 && code <= 90
  const char = String.fromCharCode(code)
  return char !== char.toLowerCase()
}

const matchBonus = (last: number, code: number) => {
  if (!isLower(code) && !isUpper(code)) return 0
  // start of text or after "/"
  if (last === -1 || last === 47) return MATCH_SLASH
  // after " ", "-" or "_"
  if (last === 32 || last === 45 || last === 95) return MATCH_WORD
  // after "."
  if (last === 46) return MATCH_DOT
  if (isUpper(code) && isLower(last)) return MATCH_CAPITAL
  return 0
}

export function prepareText(text: string): PreparedText {
  const raw = normalize(text)
  const codes = new Uint16Array(raw.length)
  const bonus = new Float32Array(raw.length)
  let mask = 0
  let last = -1
  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i)
    codes[i] = toLower(code)
    mask |= charMask(codes[i])
    bonus[i] = matchBonus(last, code)
    last = code
  }
  return { codes, bonus, mask }
}

export function prepareQuery(query: string): PreparedQuery {
  const raw = normalize(query)
  const codes = new Uint16Array(raw.length)
  let mask = 0
  for (let i = 0; i < raw.length; i++) {
    codes[i] = toLower(raw.charCodeAt(i))
    mask |= charMask(codes[i])
  }
  return { codes, mask }
}

/**
 * Prepares the text (and optional keywords) an item is matched against.
 * Reuse the result across queries to avoid normalizing the text each time.
 */
export function prepareFuzzyTarget(text: string, keywords?: readonly string[] | undefined): PreparedTarget {
  return {
    text: prepareText(text),
    keywords: keywords?.map(prepareText) ?? [],
  }
}
