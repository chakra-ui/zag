import { formatTime } from "../src/format-time"

const normalize = (value: string | null) => value?.replace(/\u00a0|\u202f/g, " ") ?? value

describe("formatTime", () => {
  test("formats 24h time from date", () => {
    const value = new Date(2024, 0, 1, 4, 5, 6)
    expect(normalize(formatTime(value, "en-US", { format: "24h" }))).toMatchInlineSnapshot(`"04:05"`)
  })

  test("formats 24h time with seconds from string", () => {
    expect(normalize(formatTime("4:5:6", "en-US", { format: "24h", withSeconds: true }))).toMatchInlineSnapshot(
      `"04:05:06"`,
    )
  })

  test("formats 12h time with locale day period", () => {
    const value = new Date(2024, 0, 1, 13, 5, 6)
    expect(normalize(formatTime(value, "en-US", { format: "12h" }))).toMatchInlineSnapshot(`"1:05 PM"`)
  })

  test("uses custom AM/PM labels when provided", () => {
    const value = new Date(2024, 0, 1, 13, 5, 6)
    expect(
      normalize(formatTime(value, "en-US", { format: "12h", amPmLabels: { am: "morning", pm: "evening" } })),
    ).toMatchInlineSnapshot(`"1:05 evening"`)
  })

  test("returns null for invalid time strings", () => {
    expect(formatTime("invalid", "en-US")).toBeNull()
    expect(formatTime("25:00", "en-US")).toBeNull()
    expect(formatTime("12:70", "en-US")).toBeNull()
  })

  test("omits seconds when withSeconds is false", () => {
    expect(normalize(formatTime("04:05:06", "en-US", { format: "24h" }))).toMatchInlineSnapshot(`"04:05"`)
  })

  test("pads seconds when missing and withSeconds is true", () => {
    expect(normalize(formatTime("4:5", "en-US", { format: "24h", withSeconds: true }))).toMatchInlineSnapshot(
      `"04:05:00"`,
    )
  })

  test("formats 12h times with locale day period in other locales", () => {
    const value = new Date(2024, 0, 1, 13, 5, 6)
    expect(normalize(formatTime(value, "ar-EG", { format: "12h" }))).toMatchInlineSnapshot(`"١:٠٥ م"`)
  })

  test("formats 24h times with seconds in other locales", () => {
    const value = new Date(2024, 0, 1, 9, 7, 3)
    expect(normalize(formatTime(value, "ar-EG", { format: "24h", withSeconds: true }))).toMatchInlineSnapshot(
      `"٠٩:٠٧:٠٣"`,
    )
  })

  test("formats string times in other locales", () => {
    expect(normalize(formatTime("9:7:3", "fa-IR", { format: "24h", withSeconds: true }))).toMatchInlineSnapshot(
      `"۰۹:۰۷:۰۳"`,
    )
  })
})
