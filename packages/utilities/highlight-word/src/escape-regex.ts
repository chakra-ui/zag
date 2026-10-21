// `-` is written as `\x2d` because `\-` is a syntax error in regexes with the `u` flag
export const escapeRegex = (term: string): string =>
  term.replace(/[|\\{}()[\]^$+*?.]/g, (char: string) => `\\${char}`).replace(/-/g, "\\x2d")
