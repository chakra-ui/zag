import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, useMachine } from "@zag-js/react"
import { schedulerControls } from "@zag-js/shared"
import { CalendarDateTime, toCalendarDate, type DateValue } from "@internationalized/date"
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

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const ROW_HEIGHT = 56

function enumerateDays(start: DateValue, end: DateValue): DateValue[] {
  const days: DateValue[] = []
  let current = start
  while (current.compare(end) <= 0) {
    days.push(current)
    current = current.add({ days: 1 })
  }
  return days
}

function getHM(d: DateValue) {
  const dt = d as CalendarDateTime
  return { h: dt.hour ?? 0, m: dt.minute ?? 0 }
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
  const dayStart = controls.context.dayStartHour ?? 7
  const dayEnd = controls.context.dayEndHour ?? 20
  const hours = Array.from({ length: dayEnd - dayStart + 1 }, (_, i) => dayStart + i)
  const gridHeight = (dayEnd - dayStart) * ROW_HEIGHT
  const pct = (h: number) => ((h - dayStart) / (dayEnd - dayStart)) * 100

  const { dragPreview } = api

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

          {api.view === "month" ? (
            // ── Month view ──────────────────────────────────────────────────────
            <div className="scheduler-month-grid">
              <div className="scheduler-month-header">
                {DAY_LABELS.map((d) => (
                  <div key={d} className="scheduler-header-cell">
                    {d}
                  </div>
                ))}
              </div>
              <div className="scheduler-month-body">
                {Array.from({ length: Math.ceil(days.length / 7) }, (_, wi) => (
                  <div key={wi} className="scheduler-month-week">
                    {days.slice(wi * 7, wi * 7 + 7).map((d) => {
                      const dayEvents = api.getEventsForDay(d)
                      const isToday = d.year === today.year && d.month === today.month && d.day === today.day
                      return (
                        <div
                          key={d.toString()}
                          {...api.getDayCellProps({ date: d })}
                          className="scheduler-month-cell"
                          data-today={isToday || undefined}
                        >
                          <div className="scheduler-month-day-number">{d.day}</div>
                          {dayEvents.slice(0, 3).map((event) => (
                            <div
                              key={event.id}
                              {...api.getEventProps({ event })}
                              className="scheduler-month-event"
                              style={{ ["--event-color"]: event.color ?? "#3b82f6" } as React.CSSProperties}
                            >
                              {String(event.title ?? "")}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <button
                              {...api.getMoreEventsProps({ date: d, count: dayEvents.length - 3 })}
                              className="scheduler-more-events"
                            >
                              +{dayEvents.length - 3} more
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // ── Day / Week view ──────────────────────────────────────────────────
            <div className="scheduler-time-grid-wrapper">
              {/* Sticky column headers */}
              <div
                className="scheduler-col-headers"
                style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}
              >
                <div className="scheduler-header-cell scheduler-gutter-header" />
                {days.map((d) => {
                  const isToday = d.year === today.year && d.month === today.month && d.day === today.day
                  return (
                    <div key={`h-${d.toString()}`} className="scheduler-header-cell" data-today={isToday || undefined}>
                      <span className="scheduler-header-day-label">
                        {DAY_LABELS[new Date(d.year, d.month - 1, d.day).getDay()]}
                      </span>
                      <span className="scheduler-header-day-num" data-today={isToday || undefined}>
                        {d.day}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Scrollable time grid body */}
              <div className="scheduler-time-grid-scroll">
                <div
                  {...api.getGridProps()}
                  className="scheduler-time-grid"
                  style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)`, height: gridHeight }}
                >
                  {/* Time gutter */}
                  <div {...api.getTimeGutterProps()} style={{ height: gridHeight }}>
                    {hours.map((h) => (
                      <div key={h} className="scheduler-hour-label" style={{ top: `${pct(h)}%` }}>
                        {String(h).padStart(2, "0")}:00
                      </div>
                    ))}
                  </div>

                  {/* Day columns */}
                  {days.map((d) => {
                    const dayEvents = api.getEventsForDay(d)

                    // Ghost preview: show in this column if dragPreview targets this day
                    const ghostEvent =
                      dragPreview?.start && toCalendarDate(dragPreview.start).compare(toCalendarDate(d)) === 0
                        ? events.find((e) => e.id === dragPreview.eventId)
                        : null

                    return (
                      <div key={d.toString()} {...api.getDayColumnProps({ date: d })} style={{ height: gridHeight }}>
                        {/* Hour grid lines */}
                        {hours.map((h) => (
                          <div key={h} className="scheduler-hour-line" style={{ top: `${pct(h)}%` }} />
                        ))}

                        {/* Half-hour lines */}
                        {hours.map((h) => (
                          <div
                            key={`${h}-half`}
                            className="scheduler-half-hour-line"
                            style={{ top: `${pct(h + 0.5)}%` }}
                          />
                        ))}

                        <div {...api.getCurrentTimeIndicatorProps()} />

                        {/* Events */}
                        {dayEvents.map((event) => {
                          const pos = api.getEventPosition(event)
                          const isDraggingThis = dragPreview?.eventId === event.id
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
                                  opacity: isDraggingThis ? 0.25 : 1,
                                  ["--event-color"]: event.color ?? "#3b82f6",
                                } as React.CSSProperties
                              }
                            >
                              <div className="scheduler-event-title">{String(event.title ?? "")}</div>
                              <div className="scheduler-event-time">{event.start.toString().slice(11, 16)}</div>
                              <div
                                {...api.getEventResizeHandleProps({ event, edge: "end" })}
                                className="scheduler-resize-handle"
                              >
                                <div className="scheduler-resize-grip" />
                              </div>
                            </div>
                          )
                        })}

                        {/* Drag ghost */}
                        {ghostEvent &&
                          dragPreview?.start &&
                          dragPreview.end &&
                          (() => {
                            const { h: sh, m: sm } = getHM(dragPreview.start)
                            const { h: eh, m: em } = getHM(dragPreview.end)
                            const total = (dayEnd - dayStart) * 60
                            const startMins = Math.max(0, (sh - dayStart) * 60 + sm)
                            const endMins = Math.min(total, (eh - dayStart) * 60 + em)
                            const origPos = api.getEventPosition(ghostEvent)
                            return (
                              <div
                                className="scheduler-drag-ghost"
                                style={
                                  {
                                    top: `${(startMins / total) * 100}%`,
                                    height: `${Math.max(0.5, ((endMins - startMins) / total) * 100)}%`,
                                    left: `calc(${origPos.left} + 2px)`,
                                    width: `calc(${origPos.width} - 4px)`,
                                    ["--event-color"]: ghostEvent.color ?? "#3b82f6",
                                  } as React.CSSProperties
                                }
                              >
                                <div className="scheduler-event-title">{String(ghostEvent.title ?? "")}</div>
                                <div className="scheduler-event-time">
                                  {`${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}`}
                                </div>
                              </div>
                            )
                          })()}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
