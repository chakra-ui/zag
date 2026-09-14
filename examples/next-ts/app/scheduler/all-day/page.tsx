"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useControls } from "@/hooks/use-controls"
import "@styles/scheduler.css"

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
  const [dropLog, setDropLog] = useState("")

  const service = useMachine(scheduler.machine, {
    id: useId(),
    ...controls.context,
    events,
    onEventDrop(d) {
      // the machine reports the region it landed in; converting the event is the consumer's call
      setDropLog(`${d.event.id} allDay:${d.allDay} ${d.newStart} → ${d.newEnd} Δ${d.delta.days}d${d.delta.minutes}m`)
      setEvents((prev) =>
        prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd, allDay: d.allDay } : e)),
      )
    },
    onEventResize: (d) =>
      setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
  })

  const api = scheduler.connect(service, normalizeProps)

  return (
    <>
      <main className="scheduler">
        <output data-testid="drop-log">{dropLog}</output>
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
          </div>

          <div className="scheduler-time-grid-wrapper">
            <div {...api.getColumnHeadersProps()}>
              <div className="scheduler-gutter-header" />
              {api.visibleDays.map((date) => (
                <div key={date.toString()} {...api.getColumnHeaderProps({ date })}>
                  <span className="scheduler-header-day-label">{api.formatWeekDay(date)}</span>
                  <span className="scheduler-header-day-num">{date.day}</span>
                </div>
              ))}
            </div>

            <div {...api.getAllDayRowProps()}>
              <div {...api.getAllDayLabelProps()}>All day</div>
              {api.visibleDays.map((date, index) => (
                <div
                  key={date.toString()}
                  {...api.getDayCellProps({ date, allDay: true })}
                  // a bar overflows to the right, so earlier cells must paint above later ones
                  style={{ zIndex: api.visibleDays.length - index }}
                >
                  {/* a bar lives in the cell it starts on and overflows across the ones it covers */}
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

                  {api.visibleDays.map((date) => (
                    <div key={date.toString()} {...api.getDayColumnProps({ date })}>
                      {api.hourRange.hours.map((hour) => (
                        <div key={hour.value} {...api.getHourLineProps({ hour })} />
                      ))}
                      <div {...api.getCurrentTimeIndicatorProps({ date })} />
                      {api
                        .getEventsForDay(date)
                        .filter((e) => !e.allDay)
                        .map((event) => (
                          <div key={event.id} {...api.getEventProps({ event })}>
                            <div className="scheduler-event-title">{event.title}</div>
                            <div {...api.getEventResizeHandleProps({ event, edge: "end" })}>
                              <div className="scheduler-resize-grip" />
                            </div>
                          </div>
                        ))}
                      <div {...api.getDragOriginProps({ date })} />
                      <div {...api.getDragPreviewProps({ date })}>
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
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
