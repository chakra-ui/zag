import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, useMachine } from "@zag-js/react"
import { schedulerControls } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

const TODAY = scheduler.getToday()

const INITIAL_EVENTS: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Team standup",
    start: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 0 }),
    end: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 30 }),
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Design review",
    start: TODAY.subtract({ days: 2 }).set({ hour: 10, minute: 0 }),
    end: TODAY.subtract({ days: 2 }).set({ hour: 11, minute: 30 }),
    color: "#10b981",
  },
  {
    id: "3",
    title: "Lunch",
    start: TODAY.set({ hour: 12, minute: 0 }),
    end: TODAY.set({ hour: 13, minute: 0 }),
    color: "#f59e0b",
  },
  {
    id: "4",
    title: "Overlap A",
    start: TODAY.set({ hour: 9, minute: 15 }),
    end: TODAY.set({ hour: 10, minute: 15 }),
    color: "#ef4444",
  },
  {
    id: "5",
    title: "Overlap B",
    start: TODAY.set({ hour: 9, minute: 30 }),
    end: TODAY.set({ hour: 10, minute: 0 }),
    color: "#8b5cf6",
  },
]

export default function Page() {
  const controls = useControls(schedulerControls)
  const [events, setEvents] = useState(INITIAL_EVENTS)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    ...controls.context,
    events,
    onEventDrop: (d) => setEvents(d.apply),
    onEventResize: (d) => setEvents(d.apply),
    onEventClick(d) {
      console.log("event clicked", d.event.title)
    },
    onSlotSelect(d) {
      console.log("slot selected", d)
    },
  })

  const api = scheduler.connect(service, normalizeProps)
  const { visibleDays, hourRange, weekDays, dragPreview } = api

  return (
    <>
      <main className="scheduler">
        <div {...api.getRootProps()}>
          <div {...api.getHeaderProps()}>
            <button {...api.getPrevTriggerProps()}>{api.prevTriggerIcon}</button>
            <button {...api.getTodayTriggerProps()}>{api.todayTriggerLabel}</button>
            <button {...api.getNextTriggerProps()}>{api.nextTriggerIcon}</button>
            <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
            <div {...api.getViewSelectProps()}>
              {(["day", "week", "month"] as scheduler.ViewType[]).map((v) => (
                <button key={v} {...api.getViewItemProps({ view: v })}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {api.view === "month" ? (
            <div className="scheduler-month-grid">
              <div className="scheduler-month-header">
                {weekDays.map((d, i) => (
                  <div key={i} className="scheduler-header-cell">
                    {d.short}
                  </div>
                ))}
              </div>
              <div className="scheduler-month-body">
                {api.getMonthGrid(api.date).map((week, wi) => (
                  <div key={wi} className="scheduler-month-week">
                    {week.map((cell) => {
                      const dayEvents = api.getEventsForDay(cell.date)
                      return (
                        <div
                          key={cell.date.toString()}
                          {...api.getDayCellProps({ date: cell.date, referenceDate: api.date })}
                          className="scheduler-month-cell"
                        >
                          <div className="scheduler-month-day-number">{cell.date.day}</div>
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
                              {...api.getMoreEventsProps({ date: cell.date, count: dayEvents.length - 3 })}
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
            <div className="scheduler-time-grid-wrapper">
              <div className="scheduler-col-headers">
                <div className="scheduler-header-cell scheduler-gutter-header" />
                {visibleDays.map((d, i) => (
                  <div key={`h-${d.toString()}`} className="scheduler-header-cell">
                    <span className="scheduler-header-day-label">{weekDays[i % 7].short}</span>
                    <span className="scheduler-header-day-num">{d.day}</span>
                  </div>
                ))}
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

                  {visibleDays.map((d) => {
                    const dayEvents = api.getEventsForDay(d)
                    const ghost = api.getDragGhost({ date: d })

                    return (
                      <div key={d.toString()} {...api.getDayColumnProps({ date: d })}>
                        {hourRange.hours.map((h) => (
                          <div key={h.value} className="scheduler-hour-line" style={h.style} />
                        ))}

                        <div {...api.getCurrentTimeIndicatorProps()} />

                        {dayEvents.map((event) => {
                          const isDraggingThis = dragPreview?.eventId === event.id
                          return (
                            <div
                              key={event.id}
                              {...api.getEventProps({ event })}
                              style={
                                {
                                  ...api.getEventStyle(event),
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

                        {ghost && (
                          <div {...ghost.props}>
                            <div className="scheduler-event-title">{String(ghost.event.title ?? "")}</div>
                          </div>
                        )}
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
