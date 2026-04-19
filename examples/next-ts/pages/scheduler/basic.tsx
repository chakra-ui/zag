import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, useMachine } from "@zag-js/react"
import { schedulerControls } from "@zag-js/shared"
import { CalendarDateTime, type DateValue } from "@internationalized/date"
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
  const controls = useControls(schedulerControls)
  const [events, setEvents] = useState(INITIAL)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    defaultDate: today,
    ...controls.context,
    events,
    onEventDrop: (d) =>
      setEvents((p) => p.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
    onEventResize: (d) =>
      setEvents((p) => p.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
  })

  const api = scheduler.connect(service, normalizeProps)
  const days = enumerateDays(api.visibleRange.start, api.visibleRange.end)
  const dayStart = controls.context.dayStartHour ?? 8
  const dayEnd = controls.context.dayEndHour ?? 18
  const HOURS = Array.from({ length: dayEnd - dayStart + 1 }, (_, i) => dayStart + i)
  const gridHeight = (dayEnd - dayStart) * 56
  const pct = (h: number) => ((h - dayStart) / (dayEnd - dayStart)) * 100

  return (
    <>
      <main className="scheduler">
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
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
