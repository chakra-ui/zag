import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, useMachine } from "@zag-js/react"
import { schedulerControls } from "@zag-js/shared"
import { CalendarDateTime, type DateValue } from "@internationalized/date"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

const today = new CalendarDateTime(2026, 4, 17, 0, 0) // TODO: Consider making this locale dependent, should this be in the state machine as well? api.getToday(), built in by default to be today's date in the user's locale.
// TODO: Consider making this in the state maching, should be locale dependent ...api.getLabelsForDayOfWeek(dayIndex: number)
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const INITIAL: scheduler.SchedulerEvent[] = [
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
]

function enumerateDays(start: DateValue, end: DateValue): DateValue[] {
  const days: DateValue[] = []
  let cur = start
  while (cur.compare(end) <= 0) {
    days.push(cur)
    cur = cur.add({ days: 1 })
  }
  return days
}

export default function Page() {
  const controls = useControls(schedulerControls)
  const [events, setEvents] = useState(INITIAL)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    defaultDate: today,
    ...controls.context,
    events,
    onEventDrop: (d) =>
      // TODO: Can we use maybe Map here for better performance instead of mapping over the entire array? We can also keep array but ensure to return index in the details object
      setEvents((p) => p.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
    onEventResize: (d) =>
      setEvents((p) => p.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
  })

  const api = scheduler.connect(service, normalizeProps)
  // TODO: Consider moving this logic to the machine and exposing the visible days in the API, since this is something that would be needed by most implementations and would reduce the amount of boilerplate needed to implement the time grid layout.
  const days = enumerateDays(api.visibleRange.start, api.visibleRange.end)
  const dayStart = controls.context.dayStartHour ?? 8
  const dayEnd = controls.context.dayEndHour ?? 18
  // TODO: Consider moving the hour range logic to the machine as well, since it is also a common feature of time grid implementations and would allow for more flexible configurations (e.g. different hour ranges for different days of the week).
  const HOURS = Array.from({ length: dayEnd - dayStart + 1 }, (_, i) => dayStart + i)
  // TODO: The grid height and percentage calculations are specific to the current styling of the time grid (e.g. 56px per hour), consider moving this logic to the machine or anatomy and exposing the necessary values in the API to allow for more flexible styling options without needing to recalculate these values in the implementation.
  const gridHeight = (dayEnd - dayStart) * 56
  // TODO: Consider moving this percentage calculation to the machine or anatomy as well, and exposing a utility function in the API for calculating event positions based on time values to reduce the amount of boilerplate needed in the implementation and ensure consistency across different implementations.
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
              {/* // TODO: Check date picker to see how to format date, visibleRange.startText, check with date picker */}
              {api.visibleRange.start.toString()} – {api.visibleRange.end.toString().slice(0, 10)}
            </span>
          </div>

          <div className="scheduler-time-grid-wrapper">
            {/* days.length, put a css variale on the root props so user don't have to worry much about the grid */}
            <div className="scheduler-col-headers" style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}>
              <div className="scheduler-header-cell scheduler-gutter-header" />
              {days.map((d) => (
                // TODO: Consider moving this to anatomy's header rendering instead of hardcoding here.
                <div key={d.toString()} className="scheduler-header-cell">
                  <span className="scheduler-header-day-label">
                    {/* TODO: Figure out how it can come from same api in maching, return an array of objects so all parts is returned */}
                    {DAY_LABELS[new Date(d.year, d.month - 1, d.day).getDay()]}
                  </span>
                  <span className="scheduler-header-day-num">{d.day}</span>
                </div>
              ))}
            </div>

            <div className="scheduler-time-grid-scroll">
              <div
                {...api.getGridProps()}
                className="scheduler-time-grid"
                //  Should be built in height, for height
                // 60px is arbitrary, also the repeat should use variables from the machine or anatomy instead of hardcoding here.
                style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)`, height: gridHeight }}
              >
                <div {...api.getTimeGutterProps()} style={{ height: gridHeight }}>
                  {/* Array of objects so we don't have to get a lot of this manually */}
                  {HOURS.map((h) => (
                    <div key={h} className="scheduler-hour-label" style={{ top: `${pct(h)}%` }}>
                      {String(h).padStart(2, "0")}:00
                    </div>
                  ))}
                </div>

                {days.map((d) => (
                  <div key={d.toString()} {...api.getDayColumnProps({ date: d })} style={{ height: gridHeight }}>
                    {HOURS.map((h) => (
                      <div key={h} className="scheduler-hour-line" style={{ top: `${pct(h)}%` }} />
                    ))}
                    {api.getEventsForDay(d).map((event) => {
                      const pos = api.getEventPosition(event)
                      return (
                        <div
                          key={event.id}
                          {...api.getEventProps({ event })}
                          style={
                            // TODO, should be built in by the machine or anatomy, and should also consider RTL layouts, maybe we can just return the calculated styles from the machine instead of calculating it here in the implementation?
                            {
                              position: "absolute",
                              top: `${pos.top * 100}%`,
                              height: `${pos.height * 100}%`,
                              left: `calc(${pos.left * 100}% + 2px)`,
                              width: `calc(${pos.width * 100}% - 4px)`,
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
                      )
                    })}
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
