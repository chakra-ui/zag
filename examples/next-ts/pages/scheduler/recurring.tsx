import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, useMachine } from "@zag-js/react"
import { schedulerControls } from "@zag-js/shared"
import { CalendarDateTime, type DateValue } from "@internationalized/date"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

const today = new CalendarDateTime(2026, 4, 17, 0, 0)
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// One weekly recurring event + one one-off. The machine expands the recurring
// one across the visible range via the expandRecurrence prop.
const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "weekly-standup",
    title: "Weekly standup",
    start: new CalendarDateTime(2026, 4, 13, 9, 0),
    end: new CalendarDateTime(2026, 4, 13, 9, 30),
    color: "#3b82f6",
    recurrence: { rrule: "FREQ=WEEKLY;BYDAY=MO" },
  },
  {
    id: "one-off",
    title: "Quarterly review",
    start: new CalendarDateTime(2026, 4, 15, 14, 0),
    end: new CalendarDateTime(2026, 4, 15, 15, 0),
    color: "#f59e0b",
  },
]

// A minimal weekly expander. In a real app, use rrule.js to honor the full
// RRULE grammar (BYDAY, COUNT, UNTIL, etc.). Kept inline so this example has
// zero external deps.
const weeklyExpander: scheduler.RecurrenceExpander = (event, range) => {
  const out: scheduler.SchedulerEvent[] = []
  const durationMs =
    new Date((event.end as CalendarDateTime).toString()).getTime() -
    new Date((event.start as CalendarDateTime).toString()).getTime()
  let cur = event.start
  let i = 0
  while (cur.compare(range.end) <= 0 && i < 100) {
    const start = cur as CalendarDateTime
    const endMs = new Date(start.toString()).getTime() + durationMs
    const endDate = new Date(endMs)
    const end = new CalendarDateTime(
      endDate.getFullYear(),
      endDate.getMonth() + 1,
      endDate.getDate(),
      endDate.getHours(),
      endDate.getMinutes(),
    )
    out.push({ ...event, id: `${event.id}:${i}`, start, end })
    cur = cur.add({ weeks: 1 })
    i++
  }
  return out
}

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

  const service = useMachine(scheduler.machine, {
    id: useId(),
    defaultDate: today,
    ...controls.context,
    events: INITIAL,
    expandRecurrence: weeklyExpander,
    recurrenceExpansionLimit: 500,
  })

  const api = scheduler.connect(service, normalizeProps)
  const days = enumerateDays(api.visibleRange.start, api.visibleRange.end)
  const dayStart = controls.context.dayStartHour ?? 8
  const dayEnd = controls.context.dayEndHour ?? 18
  const HOURS_DYN = Array.from({ length: dayEnd - dayStart + 1 }, (_, i) => dayStart + i)
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
              {api.visibleRange.start.toString().slice(0, 10)} – {api.visibleRange.end.toString().slice(0, 10)} ·{" "}
              {api.events.length} expanded events
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
                  {HOURS_DYN.map((h) => (
                    <div key={h} className="scheduler-hour-label" style={{ top: `${pct(h)}%` }}>
                      {String(h).padStart(2, "0")}:00
                    </div>
                  ))}
                </div>

                {days.map((d) => (
                  <div key={d.toString()} {...api.getDayColumnProps({ date: d })} style={{ height: gridHeight }}>
                    {HOURS_DYN.map((h) => (
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
