import { CalendarDateTime } from "@internationalized/date"
import { describe, expect, test } from "vitest"
import { getEventDaySpan, getVisibleEvents, groupEventsByDay } from "../src/utils/layout"

const dt = (d: number, h = 0, m = 0) => new CalendarDateTime(2024, 5, d, h, m)
const span = (e: any) => {
  const { start, end } = getEventDaySpan(e)
  return `${start.toString()}..${end.toString()}`
}

describe("getEventDaySpan", () => {
  test("an all-day event's end is an inclusive day", () => {
    expect(span({ start: dt(15), end: dt(15), allDay: true })).toBe("2024-05-15..2024-05-15")
    expect(span({ start: dt(15), end: dt(17), allDay: true })).toBe("2024-05-15..2024-05-17")
  })

  test("a timed event ending at midnight stops on the previous day", () => {
    expect(span({ start: dt(15, 22), end: dt(16, 0) })).toBe("2024-05-15..2024-05-15")
  })

  test("a timed event crossing midnight covers both days", () => {
    expect(span({ start: dt(15, 22), end: dt(16, 2) })).toBe("2024-05-15..2024-05-16")
  })

  test("a same-day timed event covers one day", () => {
    expect(span({ start: dt(15, 9), end: dt(15, 10) })).toBe("2024-05-15..2024-05-15")
  })
})

describe("getVisibleEvents", () => {
  const range = { start: dt(12), end: dt(18) }

  test("keeps an all-day event whose last day is the range's first day", () => {
    // regression: this used to vanish, because the range test was half-open on instants
    const trailing = { id: "trailing", title: "t", start: dt(10), end: dt(12), allDay: true } as any
    expect(getVisibleEvents([trailing], range).map((e) => e.id)).toEqual(["trailing"])
  })

  test("keeps an all-day event whose first day is the range's last day", () => {
    const leading = { id: "leading", title: "t", start: dt(18), end: dt(20), allDay: true } as any
    expect(getVisibleEvents([leading], range).map((e) => e.id)).toEqual(["leading"])
  })

  test("drops events wholly outside the range", () => {
    const before = { id: "before", title: "t", start: dt(9), end: dt(11), allDay: true } as any
    const after = { id: "after", title: "t", start: dt(19), end: dt(20), allDay: true } as any
    expect(getVisibleEvents([before, after], range)).toEqual([])
  })
})

describe("groupEventsByDay", () => {
  test("a timed event ending at midnight does not leak into the next day", () => {
    const e = { id: "night", title: "n", start: dt(15, 22), end: dt(16, 0) } as any
    expect([...groupEventsByDay([e]).keys()]).toEqual(["2024-05-15"])
  })

  test("an all-day event covers every day it spans, inclusive", () => {
    const e = { id: "offsite", title: "o", start: dt(15), end: dt(17), allDay: true } as any
    expect([...groupEventsByDay([e]).keys()]).toEqual(["2024-05-15", "2024-05-16", "2024-05-17"])
  })
})

describe("getAllDaySegments row awareness", () => {
  test("a bar is clipped at the row edge, so a month week never spans two rows", async () => {
    const { getAllDaySegments } = await import("../src/utils/all-day")
    const week1 = [12, 13, 14, 15, 16, 17, 18].map((d) => dt(d))
    const week2 = [19, 20, 21, 22, 23, 24, 25].map((d) => dt(d))
    // straddles the boundary: May 17 -> May 21
    const events = [{ id: "conf", title: "c", start: dt(17), end: dt(21), allDay: true }] as any

    const a = getAllDaySegments({ events, days: week1 })[0]!
    expect({ column: a.column, span: a.span, isStart: a.isStart, isEnd: a.isEnd }).toEqual({
      column: 5,
      span: 2,
      isStart: true,
      isEnd: false,
    })

    const b = getAllDaySegments({ events, days: week2 })[0]!
    expect({ column: b.column, span: b.span, isStart: b.isStart, isEnd: b.isEnd }).toEqual({
      column: 0,
      span: 3,
      isStart: false,
      isEnd: true,
    })
  })
})
