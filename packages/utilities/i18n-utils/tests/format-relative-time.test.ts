import { formatRelativeTime } from "../src"

const addDays = (days: number) => {
  const now = new Date()
  now.setDate(now.getDate() + days)
  return now
}

const addSeconds = (seconds: number) => {
  const now = new Date()
  now.setSeconds(now.getSeconds() + seconds)
  return now
}

const addMonths = (months: number) => {
  const now = new Date()
  now.setMonth(now.getMonth() + months)
  return now
}

describe("formatRelativeTime", () => {
  test("months", () => {
    expect(formatRelativeTime(addMonths(-2), "en-US")).toMatchInlineSnapshot(`"2 months ago"`)
    expect(formatRelativeTime(addMonths(-2), "en-US", { style: "narrow" })).toMatchInlineSnapshot(`"2mo ago"`)
  })

  test("days", () => {
    expect(formatRelativeTime(addDays(2), "en-US")).toMatchInlineSnapshot(`"in 2 days"`)
    expect(formatRelativeTime(addDays(2), "en-US", { style: "narrow" })).toMatchInlineSnapshot(`"in 2d"`)
  })

  test("secs", () => {
    expect(formatRelativeTime(addSeconds(-2), "en-US")).toMatchInlineSnapshot(`"2 seconds ago"`)
    expect(formatRelativeTime(addSeconds(-2), "en-US", { style: "narrow" })).toMatchInlineSnapshot(`"2s ago"`)
  })
})
