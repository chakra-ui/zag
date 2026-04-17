import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, useMachine } from "@zag-js/react"
import {
  CalendarDate,
  CalendarDateTime,
  endOfMonth,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  type DateValue,
} from "@internationalized/date"
import { useId } from "react"

const today = new CalendarDateTime(2026, 4, 17, 0, 0)
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]
const DAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"]

const INITIAL: scheduler.SchedulerEvent[] = Array.from({ length: 12 }, (_, m) => ({
  id: `evt-${m}`,
  title: `Meeting ${m + 1}`,
  start: new CalendarDateTime(2026, m + 1, 10 + (m % 15), 10, 0),
  end: new CalendarDateTime(2026, m + 1, 10 + (m % 15), 11, 0),
  color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][m % 5],
}))

function enumerateDays(start: DateValue, end: DateValue): DateValue[] {
  const days: DateValue[] = []
  let cur = start
  while (cur.compare(end) <= 0) {
    days.push(cur)
    cur = cur.add({ days: 1 })
  }
  return days
}

function MiniMonth({
  year,
  month,
  events,
  locale,
}: {
  year: number
  month: number
  events: scheduler.SchedulerEvent[]
  locale: string
}) {
  const firstOfMonth = new CalendarDate(year, month, 1)
  const gridStart = startOfWeek(startOfMonth(firstOfMonth), locale)
  const gridEnd = endOfWeek(endOfMonth(firstOfMonth), locale)
  const days = enumerateDays(gridStart, gridEnd)
  const weeks = Array.from({ length: Math.ceil(days.length / 7) }, (_, wi) => days.slice(wi * 7, wi * 7 + 7))

  const eventsByDay = new Map<string, scheduler.SchedulerEvent[]>()
  for (const e of events) {
    const d = e.start
    const key = `${d.year}-${d.month}-${d.day}`
    const list = eventsByDay.get(key) ?? []
    list.push(e)
    eventsByDay.set(key, list)
  }

  return (
    <div className="scheduler-mini-month">
      <div className="scheduler-mini-month-title">{MONTHS[month - 1]}</div>
      <div className="scheduler-mini-weekdays">
        {DAY_INITIALS.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="scheduler-mini-week">
          {week.map((d) => {
            const inMonth = d.month === month
            const isToday = d.year === today.year && d.month === today.month && d.day === today.day
            const key = `${d.year}-${d.month}-${d.day}`
            const dayEvents = eventsByDay.get(key) ?? []
            return (
              <div
                key={d.toString()}
                className="scheduler-mini-day"
                data-today={isToday || undefined}
                data-outside={!inMonth || undefined}
              >
                <span>{d.day}</span>
                {dayEvents.length > 0 && (
                  <span className="scheduler-mini-dot" style={{ background: dayEvents[0].color ?? "#3b82f6" }} />
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function Page() {
  const service = useMachine(scheduler.machine, {
    id: useId(),
    defaultView: "year",
    defaultDate: today,
    events: INITIAL,
  })

  const api = scheduler.connect(service, normalizeProps)
  const year = api.date.year

  return (
    <main className="scheduler">
      <div {...api.getRootProps()}>
        <div {...api.getHeaderProps()}>
          <button {...api.getPrevTriggerProps()}>←</button>
          <button {...api.getTodayTriggerProps()}>Today</button>
          <button {...api.getNextTriggerProps()}>→</button>
          <span {...api.getHeaderTitleProps()}>{year}</span>
        </div>

        <div className="scheduler-year-grid">
          {Array.from({ length: 12 }, (_, i) => (
            <MiniMonth
              key={i}
              year={year}
              month={i + 1}
              events={api.events.filter((e) => e.start.month === i + 1 && e.start.year === year)}
              locale="en-US"
            />
          ))}
        </div>
      </div>
    </main>
  )
}
