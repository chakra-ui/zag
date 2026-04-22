import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, useMachine } from "@zag-js/react"
import { schedulerControls } from "@zag-js/shared"
import { CalendarDateTime, toCalendarDate, type DateValue } from "@internationalized/date"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

const today = new CalendarDateTime(2026, 4, 17, 0, 0)

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Team standup",
    start: new CalendarDateTime(2026, 4, 17, 9, 0),
    end: new CalendarDateTime(2026, 4, 17, 9, 30),
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Design review",
    start: new CalendarDateTime(2026, 4, 18, 10, 0),
    end: new CalendarDateTime(2026, 4, 18, 11, 30),
    color: "#10b981",
  },
  {
    id: "3",
    title: "1:1 with manager",
    start: new CalendarDateTime(2026, 4, 20, 15, 0),
    end: new CalendarDateTime(2026, 4, 20, 16, 0),
    color: "#8b5cf6",
  },
  {
    id: "4",
    title: "Sprint planning",
    start: new CalendarDateTime(2026, 4, 22, 13, 0),
    end: new CalendarDateTime(2026, 4, 22, 14, 30),
    color: "#f59e0b",
  },
  {
    id: "5",
    title: "Demo day",
    start: new CalendarDateTime(2026, 4, 24, 14, 0),
    end: new CalendarDateTime(2026, 4, 24, 15, 30),
    color: "#ef4444",
  },
  {
    id: "6",
    title: "Quarterly review",
    start: new CalendarDateTime(2026, 5, 4, 11, 0),
    end: new CalendarDateTime(2026, 5, 4, 12, 0),
    color: "#ec4899",
  },
]

function groupByDay(events: scheduler.SchedulerEvent[]) {
  const buckets = new Map<string, { date: DateValue; events: scheduler.SchedulerEvent[] }>()
  for (const e of events) {
    const key = toCalendarDate(e.start).toString()
    if (!buckets.has(key)) buckets.set(key, { date: toCalendarDate(e.start), events: [] })
    buckets.get(key)!.events.push(e)
  }
  return Array.from(buckets.values()).sort((a, b) => a.date.compare(b.date))
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
  const { view: _view, ...controlsRest } = controls.context as any

  const service = useMachine(scheduler.machine, {
    id: useId(),
    defaultDate: today,
    ...controlsRest,
    // This page is purpose-built for agenda view.
    view: "agenda",
    events: INITIAL,
  })

  const api = scheduler.connect(service, normalizeProps)
  const visible = api.events.filter((e) => {
    const s = toCalendarDate(e.start)
    return s.compare(api.visibleRange.start) >= 0 && s.compare(api.visibleRange.end) <= 0
  })
  const groups = groupByDay(visible)

  return (
    <>
      <main className="scheduler">
        <div {...api.getRootProps()} style={{ maxWidth: 520 }}>
          <div {...api.getHeaderProps()}>
            <button {...api.getPrevTriggerProps()}>←</button>
            <button {...api.getTodayTriggerProps()}>Today</button>
            <button {...api.getNextTriggerProps()}>→</button>
            <span {...api.getHeaderTitleProps()}>
              {api.visibleRange.start.toString().slice(0, 10)} – {api.visibleRange.end.toString().slice(0, 10)}
            </span>
          </div>

          <div className="scheduler-mobile-agenda" style={{ marginTop: 12 }}>
            {groups.length === 0 ? (
              <div className="scheduler-mobile-agenda-empty">
                No events between {formatLongDate(api.visibleRange.start)} and {formatLongDate(api.visibleRange.end)}
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.date.toString()} style={{ marginBottom: 16 }}>
                  <div className="scheduler-mobile-agenda-title">{formatLongDate(group.date)}</div>
                  {group.events.map((event) => (
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
                  ))}
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
