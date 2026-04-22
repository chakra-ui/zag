import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, useMachine } from "@zag-js/react"
import { schedulerControls } from "@zag-js/shared"
import { CalendarDateTime, toCalendarDate, type DateValue } from "@internationalized/date"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

const today = new CalendarDateTime(2026, 4, 17, 0, 0)
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Team standup",
    start: new CalendarDateTime(2026, 4, 13, 9, 0),
    end: new CalendarDateTime(2026, 4, 13, 9, 30),
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Design review",
    start: new CalendarDateTime(2026, 4, 15, 10, 0),
    end: new CalendarDateTime(2026, 4, 15, 11, 30),
    color: "#10b981",
  },
  {
    id: "3",
    title: "Lunch",
    start: new CalendarDateTime(2026, 4, 17, 12, 0),
    end: new CalendarDateTime(2026, 4, 17, 13, 0),
    color: "#f59e0b",
  },
  {
    id: "4",
    title: "1:1 with manager",
    start: new CalendarDateTime(2026, 4, 17, 15, 0),
    end: new CalendarDateTime(2026, 4, 17, 16, 0),
    color: "#8b5cf6",
  },
  {
    id: "5",
    title: "Demo day",
    start: new CalendarDateTime(2026, 4, 24, 14, 0),
    end: new CalendarDateTime(2026, 4, 24, 15, 30),
    color: "#ef4444",
  },
]

function enumerateDays(start: DateValue, end: DateValue): DateValue[] {
  const days: DateValue[] = []
  let cur = start
  while (cur.compare(end) <= 0) {
    days.push(cur)
    cur = cur.add({ days: 1 })
  }
  return days
}

function formatTime(d: DateValue) {
  const dt = d as CalendarDateTime
  return `${String(dt.hour ?? 0).padStart(2, "0")}:${String(dt.minute ?? 0).padStart(2, "0")}`
}

function formatLongDate(d: DateValue) {
  const js = new Date(d.year, d.month - 1, d.day)
  return js.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
}

export default function Page() {
  const controls = useControls(schedulerControls)
  const [selectedDate, setSelectedDate] = useState<DateValue>(today)

  const { view: _view, ...controlsRest } = controls.context as any
  const service = useMachine(scheduler.machine, {
    id: useId(),
    defaultDate: today,
    ...controlsRest,
    // This page is purpose-built for month view — ignore the panel's view pick.
    view: "month",
    events: INITIAL,
  })

  const api = scheduler.connect(service, normalizeProps)
  const days = enumerateDays(api.visibleRange.start, api.visibleRange.end)
  const weeks = Array.from({ length: Math.ceil(days.length / 7) }, (_, wi) => days.slice(wi * 7, wi * 7 + 7))
  const selectedDayEvents = api.getEventsForDay(selectedDate)

  return (
    <>
      <main className="scheduler">
        <div {...api.getRootProps()} style={{ maxWidth: 420 }}>
          <div {...api.getHeaderProps()}>
            <button {...api.getPrevTriggerProps()}>←</button>
            <span {...api.getHeaderTitleProps()}>
              {new Date(api.date.year, api.date.month - 1, api.date.day).toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button {...api.getNextTriggerProps()}>→</button>
          </div>

          {/* Month grid */}
          <div className="scheduler-mobile-month">
            <div className="scheduler-mobile-weekdays">
              {DAY_LABELS.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="scheduler-mobile-week">
                {week.map((d) => {
                  const inMonth = d.month === api.date.month
                  const isToday = d.year === today.year && d.month === today.month && d.day === today.day
                  const isSelected = toCalendarDate(d).compare(toCalendarDate(selectedDate)) === 0
                  const dayEvents = api.getEventsForDay(d)
                  return (
                    <button
                      key={d.toString()}
                      type="button"
                      className="scheduler-mobile-day"
                      data-today={isToday || undefined}
                      data-selected={isSelected || undefined}
                      data-outside={!inMonth || undefined}
                      onClick={() => setSelectedDate(d)}
                      aria-label={formatLongDate(d)}
                    >
                      <span className="scheduler-mobile-day-num">{d.day}</span>
                      <span className="scheduler-mobile-dots">
                        {dayEvents.slice(0, 3).map((e) => (
                          <span
                            key={e.id}
                            className="scheduler-mobile-dot"
                            style={{ background: e.color ?? "#3b82f6" }}
                          />
                        ))}
                      </span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Selected day event list */}
          <div className="scheduler-mobile-agenda">
            <div className="scheduler-mobile-agenda-title">{formatLongDate(selectedDate)}</div>
            {selectedDayEvents.length === 0 ? (
              <div className="scheduler-mobile-agenda-empty">No events</div>
            ) : (
              selectedDayEvents.map((event) => (
                <div
                  key={event.id}
                  {...api.getEventProps({ event })}
                  className="scheduler-mobile-agenda-event"
                  style={{ ["--event-color"]: event.color ?? "#3b82f6" } as React.CSSProperties}
                >
                  <div className="scheduler-mobile-agenda-time">
                    {formatTime(event.start)} – {formatTime(event.end)}
                  </div>
                  <div className="scheduler-event-title">{event.title}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
