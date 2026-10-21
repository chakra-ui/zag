// `\b` only knows ASCII word characters, so treat any Unicode letter, mark, number or `_` as part of a word
const WORD_CHAR = "[\\p{L}\\p{M}\\p{N}_]"

export const wholeWord = (pattern: string): string => `(?<!${WORD_CHAR})(${pattern})(?!${WORD_CHAR})`
