"use client"

import { startOfWeek, toCalendarDateTime } from "@internationalized/date"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as scheduler from "@zag-js/scheduler"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/scheduler.css"

const TODAY = scheduler.getToday()
const WEEK = startOfWeek(TODAY, "en-US")

const BUSINESS_START = 9
const BUSINESS_END = 17

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Movable",
    start: WEEK.add({ days: 2 }).set({ hour: 10, minute: 0 }),
    end: WEEK.add({ days: 2 }).set({ hour: 11, minute: 0 }),
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Occupied",
    start: WEEK.add({ days: 2 }).set({ hour: 13, minute: 0 }),
    end: WEEK.add({ days: 2 }).set({ hour: 14, minute: 0 }),
    color: "#ef4444",
  },
]

export default function Page() {
  const [events, setEvents] = useState(INITIAL)
  const [log, setLog] = useState<string[]>([])

  const service = useMachine(scheduler.machine, {
    id: useId(),
    defaultView: "day",
    defaultDate: WEEK.add({ days: 2 }),
    dayStartHour: 7,
    dayEndHour: 20,
    events,
    // reject anything outside business hours or overlapping another event
    canDropEvent({ event, newStart, newEnd }) {
      // DateValue may be a date without a time, so narrow before reading the hour
      const start = toCalendarDateTime(newStart)
      const end = toCalendarDateTime(newEnd)
      if (start.hour < BUSINESS_START || end.hour > BUSINESS_END) return false
      return !events.some(
        (other) => other.id !== event.id && newStart.compare(other.end) < 0 && newEnd.compare(other.start) > 0,
      )
    },
    onEventDrop(details) {
      setLog((prev) => [...prev, `drop:${details.event.id}`])
      setEvents((prev) =>
        prev.map((e) => (e.id === details.event.id ? { ...e, start: details.newStart, end: details.newEnd } : e)),
      )
    },
  })

  const api = scheduler.connect(service, normalizeProps)

  return (
    <>
      <main className="scheduler">
        <p>
          Business hours {BUSINESS_START}:00–{BUSINESS_END}:00. Dragging outside them, or onto &ldquo;Occupied&rdquo;,
          marks the event <code>data-invalid</code> and the release is rejected.
        </p>

        <div {...api.getRootProps()}>
          <div {...api.getHeaderProps()}>
            <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
          </div>

          <div className="scheduler-time-grid-wrapper">
            <div {...api.getColumnHeadersProps()}>
              <div className="scheduler-gutter-header" />
              {api.columns.map((column) => (
                <div key={column.date.toString()} {...api.getColumnHeaderProps(column)}>
                  <span className="scheduler-header-day-label">{api.formatWeekDay(column.date)}</span>
                </div>
              ))}
            </div>

            <div className="scheduler-time-grid-scroll">
              <div {...api.getGridProps()}>
                <div {...api.getGridRowProps()}>
                  <div {...api.getTimeGutterProps()}>
                    {api.hourRange.hours.map((hour) => (
                      <div key={hour.value} {...api.getHourLabelProps({ hour })}>
                        {hour.label}
                      </div>
                    ))}
                  </div>

                  {api.columns.map((column) => (
                    <div key={column.date.toString()} {...api.getDayColumnProps(column)}>
                      {api.hourRange.hours.map((hour) => (
                        <div key={hour.value} {...api.getHourLineProps({ hour })} />
                      ))}
                      {api.getEventsForColumn(column).map((event) => (
                        <div key={event.id} {...api.getEventProps({ event })}>
                          <div className="scheduler-event-title">{event.title}</div>
                          <div {...api.getEventResizeHandleProps({ event, edge: "end" })}>
                            <div className="scheduler-resize-grip" />
                          </div>
                        </div>
                      ))}
                      <div {...api.getDragOriginProps(column)} />
                      <div {...api.getDragPreviewProps(column)}>
                        <div className="scheduler-event-title">{api.dragState?.event.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div data-testid="drop-log">{log.join(" ")}</div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
