export function getDecadeRange(year: number) {
  const computedYear = year - (year % 10) - 1

  const years: number[] = []

  for (let i = 0; i < 12; i += 1) {
    const value = computedYear + i
    years.push(value)
  }

  return years
}
