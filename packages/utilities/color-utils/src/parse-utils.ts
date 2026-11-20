import { clampValue, mod } from "@zag-js/utils"

const NUMBER_REGEX = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$/i

/**
 * Returns the channel tokens of `name(a, b, c[, d])` or `name(a b c[ / d])`,
 * where `names` lists the accepted function names (e.g. `rgb`, `rgba`).
 */
export function getColorArgs(value: string, names: string[]): string[] | undefined {
  const start = value.indexOf("(")
  if (start < 0 || value[value.length - 1] !== ")") return
  if (!names.includes(value.slice(0, start))) return

  const body = value.slice(start + 1, -1)
  let args: string[]

  if (body.includes(",")) {
    args = body.split(",")
  } else {
    const [main, alpha, ...rest] = body.split("/")
    if (rest.length) return
    args = main.trim().split(/\s+/)
    if (alpha !== undefined) args.push(alpha)
  }

  if (args.length < 3 || args.length > 4) return
  return args
}

/**
 * Parses a number, or a percentage where 100% equals `percentScale`.
 * Percentages are rejected when `percentScale` is omitted.
 */
export function parseNumber(token: string, percentScale?: number): number | undefined {
  token = token.trim()
  const isPercent = token[token.length - 1] === "%"
  if (isPercent) {
    if (percentScale === undefined) return
    token = token.slice(0, -1)
  }
  if (!NUMBER_REGEX.test(token)) return
  const num = Number(token)
  return isPercent ? (num / 100) * percentScale! : num
}

/** Parses the args of `hsl`/`hsb`-style colors into `[hue, percent, percent, alpha]` */
export function parseHueColorArgs(value: string, names: string[]): [number, number, number, number] | undefined {
  const args = getColorArgs(value, names)
  if (!args) return

  const hueToken = args[0].trim()
  const hue = parseNumber(hueToken.endsWith("deg") ? hueToken.slice(0, -3) : hueToken)
  const x = parseNumber(args[1], 100)
  const y = parseNumber(args[2], 100)
  const alpha = args[3] === undefined ? 1 : parseNumber(args[3], 1)
  if (hue === undefined || x === undefined || y === undefined || alpha === undefined) return

  return [mod(hue, 360), clampValue(x, 0, 100), clampValue(y, 0, 100), clampValue(alpha, 0, 1)]
}
