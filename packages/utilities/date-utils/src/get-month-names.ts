export function getMonthNames(locale: string, format: Intl.DateTimeFormatOptions["month"] = "long") {
  const date = new Date(2021, 0, 1)
  const monthNames: string[] = []
  for (let i = 0; i < 12; i++) {
    monthNames.push(date.toLocaleString(locale, { month: format }))
    date.setMonth(date.getMonth() + 1)
  }
  return monthNames
}
