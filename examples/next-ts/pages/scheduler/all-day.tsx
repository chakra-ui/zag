import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, useMachine } from "@zag-js/react"
import { schedulerControls } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

const TODAY = scheduler.getToday()

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "conf",
    title: "DevConf 2026",
    start: TODAY.subtract({ days: 3 }),
    end: TODAY.subtract({ days: 1 }),
    allDay: true,
    color: "#6366f1",
  },
  {
    id: "holiday",
    title: "Company holiday",
    start: TODAY,
    end: TODAY,
    allDay: true,
    color: "#ef4444",
  },
  {
    id: "standup",
    title: "Team standup",
    start: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 0 }),
    end: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 30 }),
    color: "#3b82f6",
  },
  {
    id: "demo",
    title: "Sprint demo",
    start: TODAY.subtract({ days: 2 }).set({ hour: 14, minute: 0 }),
    end: TODAY.subtract({ days: 2 }).set({ hour: 15, minute: 0 }),
    color: "#10b981",
  },
]

export default function Page() {
  const controls = useControls(schedulerControls)
  const [events, setEvents] = useState(INITIAL)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    ...controls.context,
    events,
    onEventDrop: (d) => setEvents(d.apply),
    onEventResize: (d) => setEvents(d.apply),
  })

  const api = scheduler.connect(service, normalizeProps)
  const { visibleDays, hourRange, weekDays } = api

  return (
    <>
      <main className="scheduler">
        <div {...api.getRootProps()}>
          <div {...api.getHeaderProps()}>
            <button {...api.getPrevTriggerProps()}>←</button>
            <button {...api.getTodayTriggerProps()}>Today</button>
            <button {...api.getNextTriggerProps()}>→</button>
            <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
          </div>

          <div className="scheduler-time-grid-wrapper">
            <div className="scheduler-col-headers">
              <div className="scheduler-header-cell scheduler-gutter-header" />
              {visibleDays.map((d, i) => (
                <div key={d.toString()} className="scheduler-header-cell">
                  <span className="scheduler-header-day-label">{weekDays[i % 7].short}</span>
                  <span className="scheduler-header-day-num">{d.day}</span>
                </div>
              ))}
            </div>

            <div {...api.getAllDayRowProps()} className="scheduler-all-day-row">
              <div className="scheduler-all-day-label">All day</div>
              {visibleDays.map((d) => {
                const allDayEvents = api.getEventsForDay(d).filter((e) => e.allDay)
                return (
                  <div key={d.toString()} className="scheduler-all-day-cell">
                    {allDayEvents.map((event) => (
                      <div
                        key={event.id}
                        {...api.getEventProps({ event })}
                        className="scheduler-all-day-event"
                        style={{ ["--event-color"]: event.color ?? "#3b82f6" } as React.CSSProperties}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>

            <div className="scheduler-time-grid-scroll">
              <div {...api.getGridProps()} className="scheduler-time-grid">
                <div {...api.getTimeGutterProps()}>
                  {hourRange.hours.map((h) => (
                    <div key={h.value} className="scheduler-hour-label" style={h.style}>
                      {h.label}
                    </div>
                  ))}
                </div>
                {visibleDays.map((d) => (
                  <div key={d.toString()} {...api.getDayColumnProps({ date: d })}>
                    {hourRange.hours.map((h) => (
                      <div key={h.value} className="scheduler-hour-line" style={h.style} />
                    ))}
                    {api
                      .getEventsForDay(d)
                      .filter((e) => !e.allDay)
                      .map((event) => (
                        <div
                          key={event.id}
                          {...api.getEventProps({ event })}
                          style={
                            {
                              ...api.getEventStyle(event),
                              ["--event-color"]: event.color,
                            } as React.CSSProperties
                          }
                        >
                          <div className="scheduler-event-title">{event.title}</div>
                          <div
                            {...api.getEventResizeHandleProps({ event, edge: "end" })}
                            className="scheduler-resize-handle"
                          >
                            <div className="scheduler-resize-grip" />
                          </div>
                        </div>
                      ))}
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
