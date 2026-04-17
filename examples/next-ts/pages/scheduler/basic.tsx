import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, useMachine } from "@zag-js/react"
import { schedulerControls } from "@zag-js/shared"
import { CalendarDateTime, type DateValue } from "@internationalized/date"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

const today = new CalendarDateTime(2026, 4, 17, 0, 0)

const INITIAL_EVENTS: scheduler.SchedulerEvent[] = [
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
    title: "Overlap A",
    start: new CalendarDateTime(2026, 4, 17, 9, 15),
    end: new CalendarDateTime(2026, 4, 17, 10, 15),
    color: "#ef4444",
  },
  {
    id: "5",
    title: "Overlap B",
    start: new CalendarDateTime(2026, 4, 17, 9, 30),
    end: new CalendarDateTime(2026, 4, 17, 10, 0),
    color: "#8b5cf6",
  },
]

const DAY_START = 7
const DAY_END = 20
const HOURS = Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => DAY_START + i)
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const ROW_HEIGHT = 48

function enumerateDays(start: DateValue, end: DateValue): DateValue[] {
  const days: DateValue[] = []
  let current = start
  while (current.compare(end) < 0) {
    days.push(current)
    current = current.add({ days: 1 })
  }
  return days
}

function hourPercent(h: number) {
  return ((h - DAY_START) / (DAY_END - DAY_START)) * 100
}

export default function Page() {
  const controls = useControls(schedulerControls)
  const [events, setEvents] = useState(INITIAL_EVENTS)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    defaultDate: today,
    ...controls.context,
    events,
    onEventDrop(d) {
      setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e)))
    },
    onEventResize(d) {
      setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e)))
    },
    onEventClick(d) {
      console.log("event clicked", d.event.title)
    },
    onSlotSelect(d) {
      console.log("slot selected", d)
    },
  })

  const api = scheduler.connect(service, normalizeProps)
  const days = enumerateDays(api.visibleRange.start, api.visibleRange.end)
  const dayStart = controls.context.dayStartHour ?? DAY_START
  const dayEnd = controls.context.dayEndHour ?? DAY_END
  const hours = Array.from({ length: dayEnd - dayStart + 1 }, (_, i) => dayStart + i)
  const gridHeight = hours.length * ROW_HEIGHT
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
            <div {...api.getViewSelectProps()}>
              {(["day", "week", "month"] as scheduler.ViewType[]).map((v) => (
                <button key={v} {...api.getViewItemProps({ view: v })}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div {...api.getGridProps()} style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}>
            <div className="scheduler-header-cell" />
            {days.map((d) => (
              <div key={`h-${d.toString()}`} className="scheduler-header-cell">
                {DAY_LABELS[new Date(d.toString()).getDay()]} {d.day}
              </div>
            ))}

            <div {...api.getTimeGutterProps()} style={{ height: gridHeight }}>
              {hours.map((h) => (
                <div key={h} className="scheduler-hour-label" style={{ top: `${pct(h)}%` }}>
                  {h}:00
                </div>
              ))}
            </div>

            {days.map((d) => {
              const dayEvents = api.getEventsForDay(d)
              return (
                <div key={d.toString()} {...api.getDayColumnProps({ date: d })} style={{ height: gridHeight }}>
                  {hours.map((h) => (
                    <div key={h} className="scheduler-hour-line" style={{ top: `${pct(h)}%` }} />
                  ))}

                  <div {...api.getCurrentTimeIndicatorProps()} />

                  {dayEvents.map((event) => {
                    const pos = api.getEventPosition(event)
                    return (
                      <div
                        key={event.id}
                        {...api.getEventProps({ event })}
                        style={
                          {
                            position: "absolute",
                            top: pos.top,
                            height: pos.height,
                            left: `calc(${pos.left} + 2px)`,
                            width: `calc(${pos.width} - 4px)`,
                            ["--event-color"]: event.color ?? "#3b82f6",
                          } as React.CSSProperties
                        }
                      >
                        <div className="scheduler-event-title">{String(event.title ?? "")}</div>
                        <div className="scheduler-event-time">{event.start.toString().slice(11, 16)}</div>
                        <div {...api.getEventResizeHandleProps({ event, edge: "end" })} />
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
