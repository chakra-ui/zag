import { CalendarDate, CalendarDateTime, type DateValue } from "@internationalized/date"
import type { RecurrenceExpander, SchedulerEvent, SchedulerPayload } from "../scheduler.types"
import { getDurationMinutes } from "../scheduler.utils"

/* -----------------------------------------------------------------------------
 * Parser
 * -----------------------------------------------------------------------------*/

export interface BydayToken {
  /**
   * 0=Sun, 1=Mon, …, 6=Sat
   */
  day: number
  /**
   * Positional: `1MO` = first Monday, `-1FR` = last Friday. Undefined = every occurrence.
   */
  position?: number
}

export interface ParsedRRule {
  freq: "daily" | "weekly" | "monthly" | "yearly"
  interval: number
  count?: number
  until?: DateValue
  byday?: BydayToken[]
  bymonthday?: number[]
}

const FREQ_MAP = { DAILY: "daily", WEEKLY: "weekly", MONTHLY: "monthly", YEARLY: "yearly" } as const
const WEEKDAY_MAP: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 }
const SIMPLE_KEYS = new Set(["FREQ", "INTERVAL", "COUNT", "UNTIL", "BYDAY", "BYMONTHDAY"])

/**
 * Parse the subset of RFC5545 RRULE strings the machine expands natively.
 * Supports: FREQ, INTERVAL, COUNT, UNTIL, BYDAY (weekly & monthly positional),
 * BYMONTHDAY. Returns null for anything else (BYSETPOS, BYMONTH, BYWEEKNO,
 * etc.) so caller falls back to a user expander.
 */
export function parseSimpleRRule(rrule: string): ParsedRRule | null {
  const body = rrule.replace(/^RRULE:/i, "")
  const entries: Record<string, string> = {}
  for (const part of body.split(";")) {
    if (!part) continue
    const [key, value] = part.split("=")
    if (!key || !value) return null
    const k = key.toUpperCase()
    if (!SIMPLE_KEYS.has(k)) return null
    entries[k] = value
  }

  const freqRaw = entries.FREQ as keyof typeof FREQ_MAP | undefined
  if (!freqRaw || !(freqRaw in FREQ_MAP)) return null
  const freq = FREQ_MAP[freqRaw]

  const interval = entries.INTERVAL ? parseInt(entries.INTERVAL, 10) : 1
  if (!Number.isFinite(interval) || interval < 1) return null

  const count = entries.COUNT ? parseInt(entries.COUNT, 10) : undefined
  if (count != null && (!Number.isFinite(count) || count < 1)) return null

  const until = entries.UNTIL ? parseRRuleDate(entries.UNTIL) : undefined
  if (entries.UNTIL && !until) return null

  const byday = entries.BYDAY ? parseByday(entries.BYDAY) : undefined
  if (entries.BYDAY && !byday) return null

  const bymonthday = entries.BYMONTHDAY ? parseBymonthday(entries.BYMONTHDAY) : undefined
  if (entries.BYMONTHDAY && !bymonthday) return null

  // Reject combinations we can't correctly expand
  if (byday && freq !== "weekly" && freq !== "monthly") return null
  if (bymonthday && freq !== "monthly") return null
  if (byday && freq === "monthly" && byday.some((b) => b.position == null)) return null

  return {
    freq,
    interval,
    ...(count != null && { count }),
    ...(until && { until }),
    ...(byday && { byday }),
    ...(bymonthday && { bymonthday }),
  }
}

function parseByday(value: string): BydayToken[] | null {
  const out: BydayToken[] = []
  for (const token of value.split(",")) {
    const m = /^(-?\d+)?(SU|MO|TU|WE|TH|FR|SA)$/.exec(token)
    if (!m) return null
    const day = WEEKDAY_MAP[m[2]]
    if (m[1]) {
      const position = parseInt(m[1], 10)
      if (!Number.isFinite(position) || position === 0) return null
      out.push({ day, position })
    } else {
      out.push({ day })
    }
  }
  return out
}

function parseBymonthday(value: string): number[] | null {
  const out: number[] = []
  for (const token of value.split(",")) {
    const n = parseInt(token, 10)
    if (!Number.isFinite(n) || n === 0 || n > 31 || n < -31) return null
    out.push(n)
  }
  return out
}

function parseRRuleDate(s: string): DateValue | undefined {
  const dateOnly = /^(\d{4})(\d{2})(\d{2})$/.exec(s)
  if (dateOnly) {
    return new CalendarDate(+dateOnly[1], +dateOnly[2], +dateOnly[3])
  }
  const dateTime = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/.exec(s)
  if (dateTime) {
    return new CalendarDateTime(+dateTime[1], +dateTime[2], +dateTime[3], +dateTime[4], +dateTime[5])
  }
  return undefined
}

/* -----------------------------------------------------------------------------
 * Expansion
 * -----------------------------------------------------------------------------*/

const FREQ_STEP: Record<ParsedRRule["freq"], (i: number) => Parameters<DateValue["add"]>[0]> = {
  daily: (i) => ({ days: i }),
  weekly: (i) => ({ weeks: i }),
  monthly: (i) => ({ months: i }),
  yearly: (i) => ({ years: i }),
}

const MAX_ITERATIONS = 10_000

function getDayOfWeek(d: DateValue): number {
  return new Date(d.year, d.month - 1, d.day).getDay()
}

function getLastDayOfMonth(d: DateValue): number {
  return d.set({ day: 1 }).add({ months: 1 }).subtract({ days: 1 }).day
}

function resolveMonthDay(monthAnchor: DateValue, dayNum: number): DateValue | null {
  const lastDay = getLastDayOfMonth(monthAnchor)
  if (dayNum > 0) {
    if (dayNum > lastDay) return null
    return monthAnchor.set({ day: dayNum })
  }
  const target = lastDay + dayNum + 1
  if (target < 1) return null
  return monthAnchor.set({ day: target })
}

function resolveMonthlyByday(monthAnchor: DateValue, weekday: number, position: number): DateValue | null {
  if (position > 0) {
    const firstOfMonth = monthAnchor.set({ day: 1 })
    const firstDow = getDayOfWeek(firstOfMonth)
    const offset = (weekday - firstDow + 7) % 7
    const candidate = firstOfMonth.add({ days: offset + (position - 1) * 7 })
    if (candidate.month !== monthAnchor.month || candidate.year !== monthAnchor.year) return null
    return candidate
  }
  const lastDay = getLastDayOfMonth(monthAnchor)
  const lastOfMonth = monthAnchor.set({ day: lastDay })
  const lastDow = getDayOfWeek(lastOfMonth)
  const offset = (lastDow - weekday + 7) % 7
  const candidate = lastOfMonth.subtract({ days: offset + (Math.abs(position) - 1) * 7 })
  if (candidate.month !== monthAnchor.month || candidate.year !== monthAnchor.year) return null
  return candidate
}

function expandSimpleRecurrence<T extends SchedulerPayload>(
  event: SchedulerEvent<T>,
  parsed: ParsedRRule,
  range: { start: DateValue; end: DateValue },
): SchedulerEvent<T>[] {
  const durationMinutes = getDurationMinutes(event.start, event.end)
  const anchor = event.recurrence?.dtstart ?? event.start
  const exdate = event.recurrence?.exdate ?? []
  const max = parsed.count ?? Infinity
  const out: SchedulerEvent<T>[] = []

  const tryEmit = (candidate: DateValue): "done" | "skip" | "ok" => {
    if (parsed.until && candidate.compare(parsed.until) > 0) return "done"
    if (candidate.compare(range.end) > 0) return "done"
    if (candidate.compare(anchor) < 0) return "skip"
    if (candidate.compare(range.start) < 0) return "skip"
    if (exdate.some((d) => d.compare(candidate) === 0)) return "skip"
    out.push({
      ...event,
      id: `${event.id}:${out.length}`,
      start: candidate,
      end: candidate.add({ minutes: durationMinutes }),
    })
    return out.length >= max ? "done" : "ok"
  }

  // Weekly + BYDAY: iterate weeks, emit each listed weekday relative to anchor's week.
  if (parsed.freq === "weekly" && parsed.byday?.length) {
    const anchorDow = getDayOfWeek(anchor)
    let weekAnchor = anchor
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const weekCandidates = parsed.byday
        .map(({ day }) => weekAnchor.add({ days: (day - anchorDow + 7) % 7 }))
        .sort((a, b) => a.compare(b))
      for (const candidate of weekCandidates) {
        const res = tryEmit(candidate)
        if (res === "done") return out
      }
      weekAnchor = weekAnchor.add({ weeks: parsed.interval })
      if (weekAnchor.compare(range.end) > 0) break
      if (parsed.until && weekAnchor.compare(parsed.until) > 0) break
    }
    return out
  }

  // Monthly + BYDAY (positional) or BYMONTHDAY: iterate months, collect candidates, emit sorted.
  if (parsed.freq === "monthly" && (parsed.byday?.length || parsed.bymonthday?.length)) {
    let monthAnchor = anchor
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const candidates: DateValue[] = []
      if (parsed.bymonthday) {
        for (const dayNum of parsed.bymonthday) {
          const d = resolveMonthDay(monthAnchor, dayNum)
          if (d) candidates.push(d)
        }
      }
      if (parsed.byday) {
        for (const { day, position } of parsed.byday) {
          if (position == null) continue
          const d = resolveMonthlyByday(monthAnchor, day, position)
          if (d) candidates.push(d)
        }
      }
      candidates.sort((a, b) => a.compare(b))
      for (const candidate of candidates) {
        const res = tryEmit(candidate)
        if (res === "done") return out
      }
      monthAnchor = monthAnchor.add({ months: parsed.interval })
      if (monthAnchor.set({ day: 1 }).compare(range.end) > 0) break
      if (parsed.until && monthAnchor.set({ day: 1 }).compare(parsed.until) > 0) break
    }
    return out
  }

  // Plain FREQ without BY-modifiers.
  const step = FREQ_STEP[parsed.freq]
  let cur = anchor
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const res = tryEmit(cur)
    if (res === "done") return out
    cur = cur.add(step(parsed.interval))
    if (cur.compare(range.end) > 0) break
  }
  return out
}

export interface ExpandRecurringEventsParams<T extends SchedulerPayload = SchedulerPayload> {
  events: SchedulerEvent<T>[]
  range: { start: DateValue; end: DateValue }
  /**
   * Cap on total expanded instances across all events.
   * @default 2000
   */
  limit?: number | undefined
  /**
   * Called for events whose rrule uses features beyond the native subset
   * (e.g. `BYSETPOS`, `BYMONTH`). Wire up `rrule.js` here.
   */
  expander?: RecurrenceExpander<T> | undefined
}

/**
 * Expand recurring events within a date range. Non-recurring events pass
 * through unchanged. Mirrors the machine's internal expansion — use when
 * you need the same set outside the scheduler (server-side rendering, lists,
 * feeds, tests).
 */
export function expandRecurringEvents<T extends SchedulerPayload = SchedulerPayload>(
  params: ExpandRecurringEventsParams<T>,
): SchedulerEvent<T>[] {
  const { events, range, limit = 2000, expander } = params
  const out: SchedulerEvent<T>[] = []
  for (const event of events) {
    const rec = event.recurrence
    if (!rec) {
      out.push(event)
      continue
    }
    const parsed = parseSimpleRRule(rec.rrule)
    if (parsed) {
      out.push(...expandSimpleRecurrence(event, parsed, range))
      continue
    }
    if (expander) {
      out.push(...expander(event, range))
    } else {
      out.push(event)
    }
  }
  return out.slice(0, limit)
}
