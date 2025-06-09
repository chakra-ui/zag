import { getHourFormat } from "../src/utils/hour-format"

describe("locale", () => {
  it("detects 12-hour format for US locale", () => {
    const usFormat = getHourFormat("en-US")
    expect(usFormat.is12Hour).toBe(true)
    expect(usFormat.is24Hour).toBe(false)
  })

  it("detects 24-hour format for German locale", () => {
    const deFormat = getHourFormat("de-DE")
    expect(deFormat.is12Hour).toBe(false)
    expect(deFormat.is24Hour).toBe(true)
  })

  it("detects 24-hour format for French locale", () => {
    const frFormat = getHourFormat("fr-FR")
    expect(frFormat.is12Hour).toBe(false)
    expect(frFormat.is24Hour).toBe(true)
  })

  it("caches format instances by locale", () => {
    const usFormat1 = getHourFormat("en-US")
    const usFormat2 = getHourFormat("en-US")
    expect(usFormat1).toBe(usFormat2) // Same instance
  })
})

describe("period", () => {
  const usFormat = getHourFormat("en-US")
  const deFormat = getHourFormat("de-DE")

  it("returns correct periods for 12-hour format", () => {
    expect(usFormat.getPeriod(0)).toBe("am") // midnight
    expect(usFormat.getPeriod(6)).toBe("am") // 6 AM
    expect(usFormat.getPeriod(11)).toBe("am") // 11 AM
    expect(usFormat.getPeriod(12)).toBe("pm") // noon
    expect(usFormat.getPeriod(15)).toBe("pm") // 3 PM
    expect(usFormat.getPeriod(23)).toBe("pm") // 11 PM
  })

  it("returns null for 24-hour format", () => {
    expect(deFormat.getPeriod(0)).toBeNull()
    expect(deFormat.getPeriod(12)).toBeNull()
    expect(deFormat.getPeriod(23)).toBeNull()
  })

  it("handles undefined hour", () => {
    expect(usFormat.getPeriod(undefined)).toBeNull()
    expect(deFormat.getPeriod(undefined)).toBeNull()
  })
})

describe("to12Hour", () => {
  const usFormat = getHourFormat("en-US")
  const deFormat = getHourFormat("de-DE")

  it("converts 24-hour to 12-hour format correctly", () => {
    expect(usFormat.to12Hour(0)).toBe(12) // midnight -> 12 AM
    expect(usFormat.to12Hour(1)).toBe(1) // 1 AM -> 1 AM
    expect(usFormat.to12Hour(11)).toBe(11) // 11 AM -> 11 AM
    expect(usFormat.to12Hour(12)).toBe(12) // noon -> 12 PM
    expect(usFormat.to12Hour(13)).toBe(1) // 1 PM -> 1 PM
    expect(usFormat.to12Hour(23)).toBe(11) // 11 PM -> 11 PM
  })

  it("returns same hour for 24-hour format", () => {
    expect(deFormat.to12Hour(0)).toBe(0)
    expect(deFormat.to12Hour(13)).toBe(13)
    expect(deFormat.to12Hour(23)).toBe(23)
  })
})

describe("to24Hour", () => {
  const usFormat = getHourFormat("en-US")
  const deFormat = getHourFormat("de-DE")

  it("converts 12-hour AM to 24-hour correctly", () => {
    expect(usFormat.to24Hour(12, "am")).toBe(0) // 12 AM -> midnight
    expect(usFormat.to24Hour(1, "am")).toBe(1) // 1 AM -> 1
    expect(usFormat.to24Hour(11, "am")).toBe(11) // 11 AM -> 11
  })

  it("converts 12-hour PM to 24-hour correctly", () => {
    expect(usFormat.to24Hour(12, "pm")).toBe(12) // 12 PM -> noon
    expect(usFormat.to24Hour(1, "pm")).toBe(13) // 1 PM -> 13
    expect(usFormat.to24Hour(11, "pm")).toBe(23) // 11 PM -> 23
  })

  it("returns same hour for 24-hour format", () => {
    expect(deFormat.to24Hour(0, null)).toBe(0)
    expect(deFormat.to24Hour(13, null)).toBe(13)
    expect(deFormat.to24Hour(23, null)).toBe(23)
  })

  it("handles null period correctly", () => {
    expect(usFormat.to24Hour(5, null)).toBe(5)
    expect(deFormat.to24Hour(15, null)).toBe(15)
  })
})

describe("getValidHours", () => {
  const usFormat = getHourFormat("en-US")
  const deFormat = getHourFormat("de-DE")

  it("generates 12 hours for 12-hour format", () => {
    const hours = usFormat.getValidHours()
    expect(hours).toHaveLength(12)
    expect(hours).toEqual([12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  })

  it("generates 24 hours for 24-hour format", () => {
    const hours = deFormat.getValidHours()
    expect(hours).toHaveLength(24)
    expect(hours).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23])
  })
})

describe("displayHourTo24Hour", () => {
  const usFormat = getHourFormat("en-US")
  const deFormat = getHourFormat("de-DE")

  it("converts display hour to 24-hour with period", () => {
    expect(usFormat.displayHourTo24Hour(1, "am")).toBe(1)
    expect(usFormat.displayHourTo24Hour(1, "pm")).toBe(13)
    expect(usFormat.displayHourTo24Hour(12, "am")).toBe(0)
    expect(usFormat.displayHourTo24Hour(12, "pm")).toBe(12)
  })

  it("returns same hour for 24-hour format", () => {
    expect(deFormat.displayHourTo24Hour(13, null)).toBe(13)
    expect(deFormat.displayHourTo24Hour(0, null)).toBe(0)
  })
})

describe("preservePeriodHour", () => {
  const usFormat = getHourFormat("en-US")
  const deFormat = getHourFormat("de-DE")

  it("preserves AM period when changing hours", () => {
    // Current time is 9 AM (hour 9), changing to display hour 3
    expect(usFormat.preservePeriodHour(3, 9)).toBe(3) // Should be 3 AM

    // Current time is 2 AM (hour 2), changing to display hour 11
    expect(usFormat.preservePeriodHour(11, 2)).toBe(11) // Should be 11 AM
  })

  it("preserves PM period when changing hours", () => {
    // Current time is 3 PM (hour 15), changing to display hour 7
    expect(usFormat.preservePeriodHour(7, 15)).toBe(19) // Should be 7 PM

    // Current time is 11 PM (hour 23), changing to display hour 1
    expect(usFormat.preservePeriodHour(1, 23)).toBe(13) // Should be 1 PM
  })

  it("handles midnight and noon correctly", () => {
    // Current time is 12 AM (hour 0), changing to display hour 5
    expect(usFormat.preservePeriodHour(5, 0)).toBe(5) // Should be 5 AM

    // Current time is 12 PM (hour 12), changing to display hour 8
    expect(usFormat.preservePeriodHour(8, 12)).toBe(20) // Should be 8 PM
  })

  it("returns same hour for 24-hour format", () => {
    expect(deFormat.preservePeriodHour(15, 10)).toBe(15)
    expect(deFormat.preservePeriodHour(5, 20)).toBe(5)
  })
})

describe("formatHour", () => {
  const usFormat = getHourFormat("en-US")
  const deFormat = getHourFormat("de-DE")

  it("formats hours with padding for 12-hour format", () => {
    expect(usFormat.formatHour(0)).toBe("12") // midnight -> 12
    expect(usFormat.formatHour(1)).toBe("01") // 1 AM -> 01
    expect(usFormat.formatHour(12)).toBe("12") // noon -> 12
    expect(usFormat.formatHour(13)).toBe("01") // 1 PM -> 01
    expect(usFormat.formatHour(23)).toBe("11") // 11 PM -> 11
  })

  it("formats hours with padding for 24-hour format", () => {
    expect(deFormat.formatHour(0)).toBe("00")
    expect(deFormat.formatHour(9)).toBe("09")
    expect(deFormat.formatHour(15)).toBe("15")
    expect(deFormat.formatHour(23)).toBe("23")
  })
})

describe("amPmPeriod", () => {
  const usFormat = getHourFormat("en-US")

  it("returns correct AM/PM periods for US locale", () => {
    expect(usFormat.amPmPeriod).toEqual({ am: "AM", pm: "PM" })
  })
})
