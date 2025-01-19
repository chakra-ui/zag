export interface YearsRange {
  from: number
  to: number
}
export function getYearsRange(range: YearsRange) {
  const years: number[] = []
  for (let year = range.from; year <= range.to; year += 1) years.push(year)
  return years
}

const FUTURE_YEAR_COERCION = 10

export function normalizeYear(year: string | null | undefined) {
  if (!year) return
  if (year.length === 3) return year.padEnd(4, "0")
  if (year.length === 2) {
    const currentYear = new Date().getFullYear()
    const currentCentury = Math.floor(currentYear / 100) * 100
    const twoDigitYear = parseInt(year.slice(-2), 10)
    const fullYear = currentCentury + twoDigitYear
    return fullYear > currentYear + FUTURE_YEAR_COERCION ? (fullYear - 100).toString() : fullYear.toString()
  }
  return year
}

export function getDecadeRange(year: number) {
  const computedYear = year - (year % 10) - 1
  const years: number[] = []
  for (let i = 0; i < 12; i += 1) {
    const value = computedYear + i
    years.push(value)
  }
  return years
}
