import type { TimePeriod } from "../time-picker.types"

const AM_DATE = new Date(2000, 0, 1, 0)
const PM_DATE = new Date(2000, 0, 1, 12)

export class HourFormat {
  private _is12Hour: boolean
  private _formatter: Intl.DateTimeFormat

  constructor(locale: string) {
    this._is12Hour = new Intl.DateTimeFormat(locale, { hour: "numeric" })
      .formatToParts(new Date())
      .some((part) => part.type === "dayPeriod")
    this._formatter = new Intl.DateTimeFormat(locale, { hour: "numeric", hour12: true })
  }

  get is12Hour(): boolean {
    return this._is12Hour
  }

  get is24Hour(): boolean {
    return !this._is12Hour
  }

  get amPmPeriod() {
    const amPeriod = this._formatter.formatToParts(AM_DATE).find((part) => part.type === "dayPeriod")?.value
    const pmPeriod = this._formatter.formatToParts(PM_DATE).find((part) => part.type === "dayPeriod")?.value
    return { am: amPeriod, pm: pmPeriod }
  }

  getPeriod(hour24: number | undefined): TimePeriod | null {
    if (hour24 === undefined || this.is24Hour) return null
    return hour24 >= 12 ? "pm" : "am"
  }

  to12Hour(hour24: number): number {
    if (this.is24Hour) return hour24
    if (hour24 === 0) return 12
    if (hour24 > 12) return hour24 - 12
    return hour24
  }

  to24Hour(hour12: number, period: TimePeriod | null): number {
    if (this.is24Hour || !period) return hour12

    // Handle 12 AM (midnight) and 12 PM (noon)
    if (hour12 === 12) {
      return period === "am" ? 0 : 12
    }

    return period === "pm" ? hour12 + 12 : hour12
  }

  formatHour(hour24: number): string {
    const displayHour = this.to12Hour(hour24)
    return displayHour < 10 ? `0${displayHour}` : `${displayHour}`
  }

  getValidHours(): number[] {
    return this.is12Hour
      ? Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i))
      : Array.from({ length: 24 }, (_, i) => i)
  }

  displayHourTo24Hour(displayHour: number, currentPeriod: TimePeriod | null): number {
    if (this.is24Hour) return displayHour
    return this.to24Hour(displayHour, currentPeriod)
  }

  preservePeriodHour(newDisplayHour: number, currentHour24: number): number {
    if (this.is24Hour) return newDisplayHour

    const currentPeriod = this.getPeriod(currentHour24)
    return this.to24Hour(newDisplayHour, currentPeriod)
  }
}

// Cache hour format instances by locale
const hourFormatCache = new Map<string, HourFormat>()

export function getHourFormat(locale: string): HourFormat {
  if (!hourFormatCache.has(locale)) {
    hourFormatCache.set(locale, new HourFormat(locale))
  }
  return hourFormatCache.get(locale)!
}
