import * as datePicker from "@zag-js/date-picker"
import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, useMachine } from "@zag-js/react"
import { CalendarDate, CalendarDateTime, type DateValue } from "@internationalized/date"
import { useId, useState } from "react"

// Composition: an inline date-picker drives the scheduler's focused date.
// Picking a day in the calendar navigates the scheduler to that week.
// Scheduler's prev/next/today also push back to the date-picker.

const today = new CalendarDateTime(2026, 4, 17, 0, 0)
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i)

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

// Normalize to CalendarDate for date-picker, CalendarDateTime for scheduler
const toCalDate = (d: DateValue) => new CalendarDate(d.year, d.month, d.day)
const toCalDateTime = (d: DateValue) => new CalendarDateTime(d.year, d.month, d.day, 0, 0)

export default function Page() {
  const [date, setDate] = useState<DateValue>(today)
  const [events, setEvents] = useState(INITIAL)

  // Inline date-picker — drives the focused date
  const dpService = useMachine(datePicker.machine, {
    id: useId(),
    inline: true,
    selectionMode: "single",
    value: [toCalDate(date)],
    focusedValue: toCalDate(date),
    onValueChange: (d) => {
      if (d.value[0]) setDate(toCalDateTime(d.value[0]))
    },
    onFocusChange: (d) => {
      if (d.focusedValue) setDate(toCalDateTime(d.focusedValue))
    },
  })

  const dp = datePicker.connect(dpService, normalizeProps)

  // Scheduler — reads the same focused date
  const service = useMachine(scheduler.machine, {
    id: useId(),
    view: "week",
    date,
    dayStartHour: 8,
    dayEndHour: 18,
    events,
    onDateChange: (d) => setDate(d.date),
    onEventDrop: (d) =>
      setEvents((p) => p.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
    onEventResize: (d) =>
      setEvents((p) => p.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
  })

  const api = scheduler.connect(service, normalizeProps)
  const days = enumerateDays(api.visibleRange.start, api.visibleRange.end)
  const gridHeight = 10 * 56
  const pct = (h: number) => ((h - 8) / 10) * 100

  return (
    <main className="scheduler">
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 16, alignItems: "start" }}>
        {/* ── Inline date-picker ─────────────────────────────────────────── */}
        <div
          className="date-picker"
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 12,
            background: "#fff",
            fontSize: 13,
          }}
        >
          <div {...dp.getRootProps()}>
            <div {...dp.getContentProps()}>
              <div
                {...dp.getViewControlProps({ view: "day" })}
                style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center" }}
              >
                <button {...dp.getPrevTriggerProps()}>←</button>
                <button {...dp.getViewTriggerProps()} style={{ flex: 1, fontWeight: 600 }}>
                  {dp.visibleRangeText.start}
                </button>
                <button {...dp.getNextTriggerProps()}>→</button>
              </div>
              <table
                {...dp.getTableProps({ view: "day" })}
                style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}
              >
                <thead {...dp.getTableHeaderProps({ view: "day" })}>
                  <tr {...dp.getTableRowProps({ view: "day" })}>
                    {dp.weekDays.map((d, i) => (
                      <th
                        key={i}
                        scope="col"
                        aria-label={d.long}
                        style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500, padding: 4 }}
                      >
                        {d.narrow}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody {...dp.getTableBodyProps({ view: "day" })}>
                  {dp.weeks.map((week, i) => (
                    <tr key={i} {...dp.getTableRowProps({ view: "day" })}>
                      {week.map((value, j) => (
                        <td key={j} {...dp.getDayTableCellProps({ value })} style={{ padding: 1, textAlign: "center" }}>
                          <div {...dp.getDayTableCellTriggerProps({ value })}>{value.day}</div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Scheduler ──────────────────────────────────────────────────── */}
        <div {...api.getRootProps()}>
          <div {...api.getHeaderProps()}>
            <button {...api.getPrevTriggerProps()}>←</button>
            <button {...api.getTodayTriggerProps()}>Today</button>
            <button {...api.getNextTriggerProps()}>→</button>
            <span {...api.getHeaderTitleProps()}>
              {api.visibleRange.start.toString().slice(0, 10)} – {api.visibleRange.end.toString().slice(0, 10)}
            </span>
          </div>

          <div className="scheduler-time-grid-wrapper">
            <div className="scheduler-col-headers" style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}>
              <div className="scheduler-header-cell scheduler-gutter-header" />
              {days.map((d) => (
                <div key={d.toString()} className="scheduler-header-cell">
                  <span className="scheduler-header-day-label">
                    {DAY_LABELS[new Date(d.year, d.month - 1, d.day).getDay()]}
                  </span>
                  <span className="scheduler-header-day-num">{d.day}</span>
                </div>
              ))}
            </div>

            <div className="scheduler-time-grid-scroll">
              <div
                {...api.getGridProps()}
                className="scheduler-time-grid"
                style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)`, height: gridHeight }}
              >
                <div {...api.getTimeGutterProps()} style={{ height: gridHeight }}>
                  {HOURS.map((h) => (
                    <div key={h} className="scheduler-hour-label" style={{ top: `${pct(h)}%` }}>
                      {String(h).padStart(2, "0")}:00
                    </div>
                  ))}
                </div>
                {days.map((d) => (
                  <div key={d.toString()} {...api.getDayColumnProps({ date: d })} style={{ height: gridHeight }}>
                    {HOURS.map((h) => (
                      <div key={h} className="scheduler-hour-line" style={{ top: `${pct(h)}%` }} />
                    ))}
                    {api.getEventsForDay(d).map((event) => {
                      const pos = api.getEventPosition(event)
                      return (
                        <div
                          key={event.id}
                          {...api.getEventProps({ event })}
                          style={
                            {
                              position: "absolute",
                              top: `${pos.top * 100}%`,
                              height: `${pos.height * 100}%`,
                              left: `calc(${pos.left * 100}% + 2px)`,
                              width: `calc(${pos.width * 100}% - 4px)`,
                              ["--event-color"]: event.color,
                            } as React.CSSProperties
                          }
                        >
                          <div className="scheduler-event-title">{event.title}</div>
                          <div
                            {...api.getEventResizeHandleProps({ event, edge: "end" })}
                            className="scheduler-resize-handle"
                          >
                            <div className="scheduler-resize-grip" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
