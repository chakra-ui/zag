"use client"

import { startOfWeek, toCalendarDate } from "@internationalized/date"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as scheduler from "@zag-js/scheduler"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/scheduler.css"

const ZONES = ["UTC", "America/New_York", "Europe/Berlin", "Asia/Tokyo"]

const TODAY = scheduler.getToday()
const WEEK = startOfWeek(TODAY, "en-US")

const EVENTS: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Global standup",
    start: WEEK.add({ days: 2 }).set({ hour: 9 }),
    end: WEEK.add({ days: 2 }).set({ hour: 10 }),
    color: "#3b82f6",
  },
]

export default function Page() {
  const [timeZone, setTimeZone] = useState("UTC")

  const service = useMachine(scheduler.machine, {
    id: useId(),
    defaultView: "day",
    defaultDate: WEEK.add({ days: 2 }),
    timeZone,
    events: EVENTS,
  })

  const api = scheduler.connect(service, normalizeProps)

  return (
    <>
      <main className="scheduler">
        <p>
          Event times are zoneless wall-clock values, so they read the same in every zone. What
          <code>timeZone</code> decides is which day counts as today.
        </p>

        <p>
          Today in this zone: <span data-testid="today">{toCalendarDate(api.today).toString()}</span>
        </p>

        <label>
          Time zone{" "}
          <select data-testid="zone" value={timeZone} onChange={(e) => setTimeZone(e.target.value)}>
            {ZONES.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </label>

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
                      {api.getEventsForColumn(column).map((event) => (
                        <div key={event.id} {...api.getEventProps({ event })}>
                          <div className="scheduler-event-title">{event.title}</div>
                          <span data-testid={`time-${event.id}`}>{api.formatTimeRange(event.start, event.end)}</span>
                        </div>
                      ))}
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
