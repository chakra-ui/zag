import { CalendarDateTime } from "@internationalized/date"
import type { SchedulerEvent, SchedulerResource } from "@zag-js/scheduler"

/**
 * Every fixture below is relative to this date rather than `today`, so a run on any day renders
 * the same grid and e2e can assert concrete dates. Examples pass it as `defaultDate`.
 *
 * A Wednesday, mid-month, in a 31-day month — far enough from either edge that a week view
 * stays inside the month, close enough that month navigation crosses a boundary quickly.
 */
export const schedulerAnchor = new CalendarDateTime(2024, 5, 15, 0, 0)

const at = (dayOffset: number, hour = 0, minute = 0) => schedulerAnchor.add({ days: dayOffset }).set({ hour, minute })

const day = (dayOffset: number) => schedulerAnchor.add({ days: dayOffset })

export const schedulerResources: SchedulerResource[] = [
  { id: "amelia", title: "Amelia Stone", color: "#6366f1" },
  { id: "brooke", title: "Brooke Chen", color: "#10b981" },
  { id: "chidi", title: "Chidi Okafor", color: "#f59e0b" },
  { id: "dara", title: "Dara Nwosu", color: "#ef4444", disabled: true },
]

/**
 * Ordinary events — enough of them, spread across the week, that layout problems are visible
 * without constructing a repro.
 */
const routine: SchedulerEvent[] = [
  { id: "standup-mon", title: "Standup", start: at(-2, 9, 0), end: at(-2, 9, 15), color: "#3b82f6" },
  { id: "standup-tue", title: "Standup", start: at(-1, 9, 0), end: at(-1, 9, 15), color: "#3b82f6" },
  { id: "standup-wed", title: "Standup", start: at(0, 9, 0), end: at(0, 9, 15), color: "#3b82f6" },
  { id: "design-review", title: "Design review", start: at(-1, 11, 0), end: at(-1, 12, 30), color: "#10b981" },
  { id: "lunch", title: "Lunch", start: at(0, 12, 0), end: at(0, 13, 0), color: "#f59e0b" },
  { id: "1on1", title: "1:1 with Amelia", start: at(1, 15, 0), end: at(1, 15, 30), color: "#8b5cf6" },
  { id: "retro", title: "Sprint retro", start: at(2, 16, 0), end: at(2, 17, 0), color: "#06b6d4" },
]

/** Three-deep overlap — two-event cases hide column-packing bugs. */
const overlapping: SchedulerEvent[] = [
  { id: "overlap-a", title: "Overlap A", start: at(0, 14, 0), end: at(0, 16, 0), color: "#ef4444" },
  { id: "overlap-b", title: "Overlap B", start: at(0, 14, 30), end: at(0, 15, 30), color: "#f97316" },
  { id: "overlap-c", title: "Overlap C", start: at(0, 15, 0), end: at(0, 17, 0), color: "#a855f7" },
]

/** Boundary cases. Each of these has caused a bug here, or is one react-big-calendar seeds for. */
const edgeCases: SchedulerEvent[] = [
  // crosses midnight, so it belongs to two days
  { id: "night-shift", title: "Night shift", start: at(1, 22, 0), end: at(2, 2, 0), color: "#334155" },
  // its sibling that stops just short of midnight — the pair should render identically up to the line
  { id: "late-same-night", title: "Late same night", start: at(1, 20, 0), end: at(1, 23, 30), color: "#475569" },
  // zero duration. Nothing should collapse to unclickable, and the layout must not divide by zero
  { id: "point-in-time", title: "Point in time", start: at(2, 11, 0), end: at(2, 11, 0), color: "#9333ea" },
  // starts before dayStartHour, so it clips at the top of a trimmed grid
  { id: "early-bird", title: "Early bird", start: at(0, 5, 30), end: at(0, 6, 30), color: "#0ea5e9" },
  // runs past dayEndHour
  { id: "late-deploy", title: "Late deploy", start: at(0, 21, 0), end: at(0, 23, 30), color: "#64748b" },
  // long enough to expose truncation and column-width bugs
  {
    id: "long-title",
    title: "Quarterly planning workshop with the extended platform and design systems group",
    start: at(3, 10, 0),
    end: at(3, 11, 0),
    color: "#db2777",
  },
  // a minimum-length event, to check it stays grabbable
  { id: "tiny", title: "Tiny", start: at(3, 13, 0), end: at(3, 13, 15), color: "#65a30d" },
]

/** All-day bars. The span shapes here are what the segment layout has to get right. */
const allDay: SchedulerEvent[] = [
  { id: "holiday", title: "Company holiday", start: day(0), end: day(0), allDay: true, color: "#ef4444" },
  // three days, wholly inside the anchor week
  { id: "offsite", title: "Team offsite", start: day(1), end: day(3), allDay: true, color: "#8b5cf6" },
  // straddles the week boundary: clipped at the end in the anchor week, at the start in the next,
  // and a month grid has to split it across two rows
  { id: "conference", title: "DevConf", start: day(2), end: day(6), allDay: true, color: "#6366f1" },
  // ends on the anchor week's first day — currently vanishes, because `getVisibleEvents` treats
  // `end` as exclusive while `groupEventsByDay` treats it as inclusive
  { id: "trailing", title: "Trailing all-day", start: day(-5), end: day(-3), allDay: true, color: "#0891b2" },
  // crosses a month boundary
  { id: "month-span", title: "Month-spanning", start: day(14), end: day(18), allDay: true, color: "#7c3aed" },
]

/** One per natively expanded RRULE shape — `recurring` has no e2e, so keep this exhaustive. */
const recurring: SchedulerEvent[] = [
  {
    id: "daily",
    title: "Daily sync",
    start: at(0, 8, 0),
    end: at(0, 8, 15),
    color: "#2563eb",
    recurrence: { rrule: "FREQ=DAILY;COUNT=10" },
  },
  {
    id: "biweekly-tue",
    title: "Biweekly planning",
    start: at(-1, 13, 0),
    end: at(-1, 14, 0),
    color: "#059669",
    recurrence: { rrule: "FREQ=WEEKLY;INTERVAL=2;BYDAY=TU;COUNT=8" },
  },
  {
    id: "mwf",
    title: "MWF check-in",
    start: at(0, 17, 0),
    end: at(0, 17, 30),
    color: "#d97706",
    recurrence: { rrule: "FREQ=WEEKLY;BYDAY=MO,WE,FR" },
  },
  {
    id: "first-monday",
    title: "First Monday all-hands",
    start: at(0, 10, 0),
    end: at(0, 11, 0),
    color: "#be123c",
    recurrence: { rrule: "FREQ=MONTHLY;BYDAY=1MO" },
  },
  {
    id: "last-friday",
    title: "Last Friday demo",
    start: at(0, 15, 0),
    end: at(0, 16, 0),
    color: "#0f766e",
    recurrence: { rrule: "FREQ=MONTHLY;BYDAY=-1FR" },
  },
  {
    id: "month-end",
    title: "Month-end close",
    start: at(0, 18, 0),
    end: at(0, 19, 0),
    color: "#4338ca",
    recurrence: { rrule: "FREQ=MONTHLY;BYMONTHDAY=-1" },
  },
]

/** Non-Latin titles, so RTL and script-specific metrics get exercised by default. */
const international: SchedulerEvent[] = [
  { id: "i18n-ar", title: "اجتماع الفريق", start: at(4, 9, 0), end: at(4, 10, 0), color: "#0d9488" },
  { id: "i18n-ja", title: "チームミーティング", start: at(4, 11, 0), end: at(4, 12, 0), color: "#c2410c" },
]

/** Assigned across resources, including one on the disabled lane. */
export const schedulerResourceEvents: SchedulerEvent[] = [
  { id: "r-1", title: "Consult", start: at(0, 9, 0), end: at(0, 10, 0), resourceId: "amelia", color: "#6366f1" },
  { id: "r-2", title: "Consult", start: at(0, 9, 30), end: at(0, 10, 30), resourceId: "brooke", color: "#10b981" },
  // same slot as r-1 but a different lane: these must not be reported as conflicting
  { id: "r-3", title: "Review", start: at(0, 9, 0), end: at(0, 11, 0), resourceId: "chidi", color: "#f59e0b" },
  // genuinely conflicting, same lane
  {
    id: "r-4",
    title: "Double-booked",
    start: at(0, 9, 30),
    end: at(0, 10, 30),
    resourceId: "amelia",
    color: "#ef4444",
  },
  { id: "r-5", title: "Blocked", start: at(1, 13, 0), end: at(1, 14, 0), resourceId: "dara", color: "#94a3b8" },
  // multi-day, so a timeline lane has something with real width to measure
  {
    id: "r-maintenance",
    title: "Maintenance",
    start: at(1, 8, 0),
    end: at(3, 12, 0),
    resourceId: "chidi",
    color: "#64748b",
  },
]

/** The default set: routine load plus every edge case, for examples that want one grid to stress. */
export const schedulerEvents: SchedulerEvent[] = [...routine, ...overlapping, ...edgeCases, ...allDay, ...international]

export const schedulerAllDayEvents: SchedulerEvent[] = [...allDay, ...routine.slice(0, 3)]

export const schedulerRecurringEvents: SchedulerEvent[] = recurring

/**
 * Days when the clock shifts, which is where timezone handling breaks if it is going to. Absolute
 * rather than anchor-relative, because the whole point is the specific real date.
 */
export const schedulerDstEvents: SchedulerEvent[] = [
  {
    id: "dst-start-us",
    title: "DST starts (America)",
    start: new CalendarDateTime(2024, 3, 10, 1, 30),
    end: new CalendarDateTime(2024, 3, 10, 3, 30),
    color: "#f59e0b",
  },
  {
    id: "dst-end-us",
    title: "DST ends (America)",
    start: new CalendarDateTime(2024, 11, 3, 1, 0),
    end: new CalendarDateTime(2024, 11, 3, 2, 0),
    color: "#f97316",
  },
  {
    id: "dst-start-eu",
    title: "DST starts (Europe)",
    start: new CalendarDateTime(2024, 3, 31, 1, 30),
    end: new CalendarDateTime(2024, 3, 31, 3, 30),
    color: "#0ea5e9",
  },
  {
    id: "dst-end-eu",
    title: "DST ends (Europe)",
    start: new CalendarDateTime(2024, 10, 27, 1, 0),
    end: new CalendarDateTime(2024, 10, 27, 2, 0),
    color: "#0284c7",
  },
]

/** Unscheduled items for the external-drop example. */
export const schedulerBacklog = [
  { id: "b1", title: "Write RFC" },
  { id: "b2", title: "Review PR" },
  { id: "b3", title: "Fix flaky test" },
]
