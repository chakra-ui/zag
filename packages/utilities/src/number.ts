import { isNumeric } from "./assertion"

/**
 * Counts the number of decimal places a number has
 * @param value the decimal value to count
 */
export function countDecimals(value: number) {
  if (!isNumeric(value)) return 0

  let e = 1
  let p = 0
  while (Math.round(value * e) / e !== value) {
    e *= 10
    p += 1
  }
  return p
}

/**
 * Converts a value to a specific precision (or decimal points).
 *
 * Returns a string representing a number in fixed-point notation.
 *
 * @param value the value to convert
 * @param decimals the precision or decimal points
 */
export function toFixed(value: number, decimals?: number) {
  // clean value
  value = parseFloat(value.toString())
  value = isNumeric(value) ? value : 0

  // compute decimals
  let nextValue: string | number = value
  const scaleFactor = 10 ** (decimals ?? 10)
  nextValue = Math.round(nextValue * scaleFactor) / scaleFactor

  return decimals ? nextValue.toFixed(decimals) : nextValue.toString()
}

/**
 * Tests if a value string is a valid floating point
 * character (including exponents)
 */
export function isFloatingPoint(value: string) {
  return /^([-+]?\d*\.?\d+)(?:[eE]([-+]?\d+))?$/.test(value)
}
