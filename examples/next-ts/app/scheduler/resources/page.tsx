"use client"

import { startOfWeek } from "@internationalized/date"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as scheduler from "@zag-js/scheduler"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/scheduler.css"

const TODAY = scheduler.getToday()
// anchor to the week: TODAY-relative events fall out of view near a week boundary
const WEEK = startOfWeek(TODAY, "en-US")

const RESOURCES: scheduler.SchedulerResource[] = [
  { id: "amelia", title: "Amelia", color: "#3b82f6" },
  { id: "brooke", title: "Brooke", color: "#10b981" },
  { id: "cass", title: "Cass", color: "#f59e0b", disabled: true },
]

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Intake",
    resourceId: "amelia",
    start: WEEK.add({ days: 2 }).set({ hour: 9, minute: 0 }),
    end: WEEK.add({ days: 2 }).set({ hour: 10, minute: 0 }),
  },
  {
    id: "2",
    title: "Fitting",
    resourceId: "brooke",
    start: WEEK.add({ days: 2 }).set({ hour: 9, minute: 30 }),
    end: WEEK.add({ days: 2 }).set({ hour: 11, minute: 0 }),
  },
  {
    id: "3",
    title: "Blocked",
    resourceId: "cass",
    start: WEEK.add({ days: 2 }).set({ hour: 13, minute: 0 }),
    end: WEEK.add({ days: 2 }).set({ hour: 14, minute: 0 }),
  },
]

export default function Page() {
  const [events, setEvents] = useState(INITIAL)
  const [log, setLog] = useState<string[]>([])

  const service = useMachine(scheduler.machine, {
    id: useId(),
    defaultView: "day",
    defaultDate: WEEK.add({ days: 2 }),
    dayStartHour: 8,
    dayEndHour: 18,
    resources: RESOURCES,
    groupBy: "resource",
    events,
    onEventDrop(details) {
      setLog((prev) => [...prev, `drop:${details.event.id}:${details.resource?.id ?? "none"}`])
      setEvents((prev) =>
        prev.map((e) =>
          e.id === details.event.id
            ? { ...e, start: details.newStart, end: details.newEnd, resourceId: details.resource?.id ?? e.resourceId }
            : e,
        ),
      )
    },
    onSlotSelect(details) {
      setLog((prev) => [...prev, `slot:${details.resource?.id ?? "none"}`])
    },
  })

  const api = scheduler.connect(service, normalizeProps)

  return (
    <>
      <main className="scheduler">
        <div {...api.getRootProps()}>
          <div {...api.getHeaderProps()}>
            <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
          </div>

          <div className="scheduler-time-grid-wrapper">
            <div {...api.getColumnHeadersProps()}>
              <div className="scheduler-gutter-header" />
              {api.columns.map((column) => (
                <div key={`${column.date}:${column.resource?.id}`} {...api.getColumnHeaderProps(column)}>
                  <span className="scheduler-header-day-label">{column.resource?.title}</span>
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
                    <div key={`${column.date}:${column.resource?.id}`} {...api.getDayColumnProps(column)}>
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
