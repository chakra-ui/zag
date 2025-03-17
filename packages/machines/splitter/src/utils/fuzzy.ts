/**
 * This code was modified from react-resizable-panels by Brian Vaughn
 * @see https://github.com/bvaughn/react-resizable-panels
 */

export const PRECISION = 10

export function fuzzyCompareNumbers(actual: number, expected: number, fractionDigits: number = PRECISION): number {
  if (actual.toFixed(fractionDigits) === expected.toFixed(fractionDigits)) {
    return 0
  } else {
    return actual > expected ? 1 : -1
  }
}

export function fuzzyNumbersEqual(
  actual: number | undefined,
  expected: number | undefined,
  fractionDigits: number = PRECISION,
): boolean {
  if (actual == null || expected == null) return false
  return fuzzyCompareNumbers(actual, expected, fractionDigits) === 0
}

export function fuzzySizeEqual(actual: number[], expected: number[], fractionDigits?: number): boolean {
  if (actual.length !== expected.length) {
    return false
  }

  for (let index = 0; index < actual.length; index++) {
    const actualSize = actual[index] as number
    const expectedSize = expected[index] as number

    if (!fuzzyNumbersEqual(actualSize, expectedSize, fractionDigits)) {
      return false
    }
  }

  return true
}
