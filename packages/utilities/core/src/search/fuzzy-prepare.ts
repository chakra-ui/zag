export interface PreparedText {
  codes: Uint16Array
  bonus: Float32Array
  mask: number
}

export interface PreparedTarget {
  text: PreparedText
  keywords: PreparedText[]
}

// Scoring adapted from fzy (MIT, John Hawthorn)
const MATCH_SLASH = 0.9
const MATCH_WORD = 0.8
const MATCH_CAPITAL = 0.7
const MATCH_DOT = 0.6
export const MATCH_CONSECUTIVE = 1
export const GAP_LEADING = -0.005
export const GAP_TRAILING = -0.005
export const GAP_INNER = -0.01

export const KEYWORD_WEIGHT = 0.9
export const PER_WORD_WEIGHT = 0.95
// the sigmoid rounds long matches to 1, so cap partial matches below an exact one
export const MAX_PARTIAL = 1 - 1e-6

export const MAX_LENGTH = 256
export const WHITESPACE = /\s+/
const DIACRITICS = /[̀-ͯ]/g
const LETTER_OR_DIGIT = /[\p{L}\p{N}]/u

export const stripDiacritics = (value: string) => value.normalize("NFD").replace(DIACRITICS, "")

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
  const raw = stripDiacritics(text).slice(0, MAX_LENGTH)
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

export const prepareTarget = (text: string, keywords?: readonly string[] | undefined): PreparedTarget => ({
  text: prepareText(text),
  keywords: keywords?.map(prepareText) ?? [],
})

export function isSubsequence(query: PreparedText, target: PreparedText) {
  const qc = query.codes
  const tc = target.codes
  if (qc.length > tc.length || (query.mask & target.mask) !== query.mask) return false
  let k = 0
  for (let j = 0; j < tc.length && k < qc.length; j++) if (tc[j] === qc[k]) k++
  return k === qc.length
}
