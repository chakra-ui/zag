"use client"

import * as scheduler from "@zag-js/scheduler"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { normalizeProps, useMachine } from "@zag-js/react"
import { schedulerAnchor, schedulerControls, schedulerEvents } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useControls } from "@/hooks/use-controls"
import "@styles/scheduler.css"

export default function Page() {
  const controls = useControls(schedulerControls)
  const [events, setEvents] = useState(schedulerEvents)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    ...controls.context,
    defaultDate: schedulerAnchor,
    events,
    onEventDrop: (d) =>
      setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
    onEventResize: (d) =>
      setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
    onEventClick(d) {
      console.log("event clicked", d.event.title)
    },
    onSlotSelect(d) {
      console.log("slot selected", d)
    },
  })

  const api = scheduler.connect(service, normalizeProps)

  return (
    <>
      <main className="scheduler">
        <div {...api.getRootProps()}>
          <div {...api.getHeaderProps()}>
            <button {...api.getPrevTriggerProps()}>
              <ChevronLeft />
            </button>
            <button {...api.getTodayTriggerProps()}>Today</button>
            <button {...api.getNextTriggerProps()}>
              <ChevronRight />
            </button>
            <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
            <div {...api.getViewSelectProps()}>
              {(["day", "week", "month"] as scheduler.ViewType[]).map((v) => (
                <button key={v} {...api.getViewItemProps({ view: v })}>
                  {api.getViewText(v)}
                </button>
              ))}
            </div>
          </div>

          {api.view === "month" ? (
            <div className="scheduler-month-grid">
              <div className="scheduler-month-header">
                {api.getWeekDays().map((day, i) => (
                  <div key={i} className="scheduler-month-weekday">
                    {day.short}
                  </div>
                ))}
              </div>
              <div className="scheduler-month-body">
                {api.getMonthGrid(api.date).map((week, weekIndex) => {
                  // segments are asked for one row at a time, so a bar clips at the week edge
                  const bars = api.getAllDaySegments(week)
                  return (
                    <div key={weekIndex} className="scheduler-month-week">
                      {week.map((date, dayIndex) => {
                        const timed = api.getEventsForDay(date).filter((e) => !e.allDay)
                        return (
                          <div
                            key={date.toString()}
                            {...api.getDayCellProps({ date, referenceDate: api.date })}
                            className="scheduler-month-cell"
                            style={{ zIndex: week.length - dayIndex }}
                          >
                            <div className="scheduler-month-day-number">{date.day}</div>
                            {bars
                              .filter((segment) => segment.column === dayIndex)
                              .map((segment) => (
                                <div
                                  key={segment.event.id}
                                  {...api.getEventProps({ event: segment.event, layout: "all-day", segment })}
                                  className="scheduler-month-bar"
                                >
                                  {segment.event.title}
                                </div>
                              ))}
                            {timed.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                {...api.getEventProps({ event, layout: "list" })}
                                className="scheduler-month-event"
                              >
                                {event.title}
                              </div>
                            ))}
                            {timed.length > 2 && (
                              <button {...api.getMoreEventsProps({ date, count: timed.length - 2 })}>
                                +{timed.length - 2} more
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="scheduler-time-grid-wrapper">
              <div {...api.getColumnHeadersProps()}>
                <div className="scheduler-gutter-header" />
                {api.visibleDays.map((date) => (
                  <div key={`h-${date.toString()}`} {...api.getColumnHeaderProps({ date })}>
                    <span className="scheduler-header-day-label">{api.formatWeekDay(date)}</span>
                    <span className="scheduler-header-day-num">{date.day}</span>
                  </div>
                ))}
              </div>

              <div {...api.getAllDayRowProps()}>
                <div {...api.getAllDayLabelProps()}>All day</div>
                {api.visibleDays.map((date, index) => (
                  <div
                    key={`ad-${date.toString()}`}
                    {...api.getDayCellProps({ date, allDay: true })}
                    style={{ zIndex: api.visibleDays.length - index }}
                  >
                    {api
                      .getAllDaySegments()
                      .filter((segment) => segment.column === index)
                      .map((segment) => (
                        <div
                          key={segment.event.id}
                          {...api.getEventProps({ event: segment.event, layout: "all-day", segment })}
                        >
                          {segment.isStart && (
                            <div {...api.getEventResizeHandleProps({ event: segment.event, edge: "start" })} />
                          )}
                          <span className="scheduler-event-title">{segment.event.title}</span>
                          {segment.isEnd && (
                            <div {...api.getEventResizeHandleProps({ event: segment.event, edge: "end" })} />
                          )}
                        </div>
                      ))}
                  </div>
                ))}
              </div>

              <div className="scheduler-time-grid-scroll" tabIndex={0} role="group" aria-label="Time grid">
                <div {...api.getGridProps()}>
                  <div {...api.getGridRowProps()}>
                    <div {...api.getTimeGutterProps()}>
                      {api.hourRange.hours.map((hour) => (
                        <div key={hour.value} {...api.getHourLabelProps({ hour })}>
                          {hour.label}
                        </div>
                      ))}
                    </div>

                    {api.visibleDays.map((date) => {
                      const dayEvents = api.getEventsForDay(date).filter((e) => !e.allDay)

                      return (
                        <div key={date.toString()} {...api.getDayColumnProps({ date })}>
                          {api.hourRange.hours.map((hour) => (
                            <div key={hour.value} {...api.getHourLineProps({ hour })} />
                          ))}

                          <div {...api.getCurrentTimeIndicatorProps({ date })} />

                          {dayEvents.map((event) => (
                            <div key={event.id} {...api.getEventProps({ event })}>
                              <div className="scheduler-event-title">{event.title}</div>
                              <div className="scheduler-event-time">{event.start.toString().slice(11, 16)}</div>
                              <div {...api.getEventResizeHandleProps({ event, edge: "end" })}>
                                <div className="scheduler-resize-grip" />
                              </div>
                            </div>
                          ))}

                          <div {...api.getDragPreviewProps({ date })}>
                            <div className="scheduler-event-title">{api.dragState?.event.title}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
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
