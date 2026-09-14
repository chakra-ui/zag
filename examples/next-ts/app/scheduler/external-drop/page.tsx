"use client"

import { startOfWeek } from "@internationalized/date"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerBacklog } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/scheduler.css"

const TODAY = schedulerAnchor
const WEEK = startOfWeek(TODAY, "en-US")

export default function Page() {
  const [events, setEvents] = useState<scheduler.SchedulerEvent[]>([])
  const [backlog, setBacklog] = useState(schedulerBacklog)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    defaultView: "day",
    defaultDate: WEEK.add({ days: 2 }),
    dayStartHour: 8,
    dayEndHour: 18,
    events,
    onEventReceive(details) {
      const item = backlog.find((b) => b.id === details.data)
      if (!item) return
      setBacklog((prev) => prev.filter((b) => b.id !== item.id))
      setEvents((prev) => [
        ...prev,
        { id: item.id, title: item.title, start: details.start, end: details.end, color: "#3b82f6" },
      ])
    },
  })

  const api = scheduler.connect(service, normalizeProps)

  return (
    <>
      <main className="scheduler">
        <p>Drag an item from the backlog onto the grid.</p>

        <ul className="scheduler-backlog" data-testid="backlog">
          {backlog.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                draggable
                data-testid={`backlog-${item.id}`}
                onDragStart={(event) => event.dataTransfer.setData("text/plain", item.id)}
              >
                {item.title}
              </button>
            </li>
          ))}
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
                        <div key={event.id} {...api.getEventProps({ event })}>
                          <div className="scheduler-event-title">{event.title}</div>
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
