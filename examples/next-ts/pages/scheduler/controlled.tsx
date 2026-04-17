import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, useMachine } from "@zag-js/react"
import { CalendarDateTime, type DateValue } from "@internationalized/date"
import { useId, useState } from "react"

const today = new CalendarDateTime(2026, 4, 17, 0, 0)
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i)

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Sprint planning",
    start: new CalendarDateTime(2026, 4, 13, 9, 0),
    end: new CalendarDateTime(2026, 4, 13, 10, 0),
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Interview",
    start: new CalendarDateTime(2026, 4, 14, 11, 0),
    end: new CalendarDateTime(2026, 4, 14, 12, 0),
    color: "#ef4444",
  },
  {
    id: "3",
    title: "1:1 with manager",
    start: new CalendarDateTime(2026, 4, 16, 14, 0),
    end: new CalendarDateTime(2026, 4, 16, 14, 30),
    color: "#10b981",
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

export default function Page() {
  // controlled view + date
  const [view, setView] = useState<scheduler.ViewType>("week")
  const [date, setDate] = useState<DateValue>(today)
  const [events, setEvents] = useState(INITIAL)
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    view,
    date,
    dayStartHour: 8,
    dayEndHour: 18,
    events,
    onViewChange: (d) => setView(d.view),
    onDateChange: (d) => setDate(d.date),
    onEventClick: (d) => setSelectedTitle(d.event.title),
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
      <div {...api.getRootProps()}>
        <div {...api.getHeaderProps()}>
          <button {...api.getPrevTriggerProps()}>←</button>
          <button {...api.getTodayTriggerProps()}>Today</button>
          <button {...api.getNextTriggerProps()}>→</button>
          <span {...api.getHeaderTitleProps()}>
            {api.visibleRange.start.toString().slice(0, 10)} – {api.visibleRange.end.toString().slice(0, 10)}
          </span>
          <div {...api.getViewSelectProps()}>
            {(["day", "week"] as scheduler.ViewType[]).map((v) => (
              <button key={v} {...api.getViewItemProps({ view: v })}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
          View: <strong>{view}</strong> · {events.length} events
          {selectedTitle ? (
            <>
              {" · Selected: "}
              <strong>{selectedTitle}</strong>
            </>
          ) : null}
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
    </main>
  )
}
