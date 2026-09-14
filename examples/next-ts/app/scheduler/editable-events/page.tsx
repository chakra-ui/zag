"use client"

import { startOfWeek } from "@internationalized/date"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/scheduler.css"

const TODAY = schedulerAnchor
const WEEK = startOfWeek(TODAY, "en-US")
const DAY = WEEK.add({ days: 2 })

const INITIAL: scheduler.SchedulerEvent[] = [
  // freely editable
  { id: "movable", title: "Movable", start: DAY.set({ hour: 9 }), end: DAY.set({ hour: 10 }), color: "#3b82f6" },
  // locked via the `disabled` flag
  { id: "locked", title: "Locked", start: DAY.set({ hour: 11 }), end: DAY.set({ hour: 12 }), disabled: true },
  // draggable but not resizable, decided by the predicates below
  { id: "fixed-length", title: "Fixed length", start: DAY.set({ hour: 14 }), end: DAY.set({ hour: 15 }) },
  // these two overlap, so both report a conflict
  { id: "conflict-a", title: "Conflict A", start: DAY.set({ hour: 16 }), end: DAY.set({ hour: 17 }) },
  { id: "conflict-b", title: "Conflict B", start: DAY.set({ hour: 16, minute: 30 }), end: DAY.set({ hour: 17 }) },
]

export default function Page() {
  const [events, setEvents] = useState(INITIAL)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    defaultView: "day",
    defaultDate: DAY,
    dayStartHour: 8,
    dayEndHour: 19,
    events,
    canDragEvent: (event) => !event.disabled,
    canResizeEvent: (event) => !event.disabled && event.id !== "fixed-length",
    onEventDrop(details) {
      setEvents((prev) =>
        prev.map((e) => (e.id === details.event.id ? { ...e, start: details.newStart, end: details.newEnd } : e)),
      )
    },
  })

  const api = scheduler.connect(service, normalizeProps)

  return (
    <>
      <main className="scheduler">
        <ul>
          <li>Movable — drag and resize</li>
          <li>Locked — `disabled`, neither</li>
          <li>Fixed length — drag only, `canResizeEvent` says no</li>
          <li>Conflict A / B — overlap, so `hasConflict` is true for both</li>
        </ul>

        <div {...api.getRootProps()}>
          <div className="scheduler-time-grid-wrapper">
            <div {...api.getColumnHeadersProps()}>
              <div className="scheduler-gutter-header" />
              {api.columns.map((column) => (
                <div key={column.date.toString()} {...api.getColumnHeaderProps(column)}>
                  <span className="scheduler-header-day-label">{api.formatWeekDay(column.date)}</span>
                </div>
              ))}
            </div>

            <div className="scheduler-time-grid-scroll" tabIndex={0} aria-label="Schedule grid">
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
                        <div key={event.id} {...api.getEventProps({ event })} data-conflicting={api.hasConflict(event)}>
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
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
