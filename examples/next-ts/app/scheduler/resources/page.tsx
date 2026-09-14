"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerResourceEvents, schedulerResources } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/scheduler.css"

export default function Page() {
  const [events, setEvents] = useState(schedulerResourceEvents)
  const [log, setLog] = useState<string[]>([])

  const service = useMachine(scheduler.machine, {
    id: useId(),
    defaultView: "day",
    dayStartHour: 8,
    dayEndHour: 18,
    resources: schedulerResources,
    groupBy: "resource",
    defaultDate: schedulerAnchor,
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
