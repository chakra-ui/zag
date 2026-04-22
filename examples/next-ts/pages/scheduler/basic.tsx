import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, useMachine } from "@zag-js/react"
import { schedulerControls } from "@zag-js/shared"
import { toCalendarDate } from "@internationalized/date"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

// Events anchored relative to today (resolved by the machine's helper) so the
// default view always has content, regardless of when the demo runs.
const TODAY = scheduler.getToday()

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Team standup",
    start: TODAY.subtract({ days: 2 }).set({ hour: 9, minute: 0 }),
    end: TODAY.subtract({ days: 2 }).set({ hour: 9, minute: 30 }),
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Design review",
    start: TODAY.set({ hour: 10, minute: 0 }),
    end: TODAY.set({ hour: 11, minute: 30 }),
    color: "#10b981",
  },
  {
    id: "3",
    title: "Lunch",
    start: TODAY.add({ days: 2 }).set({ hour: 12, minute: 0 }),
    end: TODAY.add({ days: 2 }).set({ hour: 13, minute: 0 }),
    color: "#f59e0b",
  },
]

export default function Page() {
  const controls = useControls(schedulerControls)
  const [events, setEvents] = useState(INITIAL)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    // defaultDate defaults to today via the machine itself — no need to pass it.
    ...controls.context,
    events,
    onEventDrop: (d) => setEvents(d.apply),
    onEventResize: (d) => setEvents(d.apply),
  })

  const api = scheduler.connect(service, normalizeProps)
  const { visibleDays, hourRange, weekDays, dragPreview, dragOrigin } = api

  const ghostColor = (id: string) => api.getEventById(id)?.color ?? "#3b82f6"

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
                  const dayKey = toCalendarDate(d).toString()
                  const ghostHere =
                    dragPreview?.start && toCalendarDate(dragPreview.start).toString() === dayKey ? dragPreview : null
                  const originHere =
                    dragOrigin && toCalendarDate(dragOrigin.start).toString() === dayKey ? dragOrigin : null
                  return (
                    <div key={d.toString()} {...api.getDayColumnProps({ date: d })}>
                      {hourRange.hours.map((h) => (
                        <div key={h.value} className="scheduler-hour-line" style={h.style} />
                      ))}
                      {api.getEventsForDay(d).map((event) => (
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

                      {/* Origin outline: dashed marker at where the drag started. */}
                      {originHere && dragPreview?.eventId !== undefined && (
                        <div
                          className="scheduler-drag-origin"
                          style={
                            {
                              top: `${api.getTimePercent(originHere.start) * 100}%`,
                              height: `${(api.getTimePercent(originHere.end) - api.getTimePercent(originHere.start)) * 100}%`,
                              insetInlineStart: "2px",
                              insetInlineEnd: "2px",
                              ["--event-color"]: ghostColor(originHere.eventId),
                            } as React.CSSProperties
                          }
                        />
                      )}

                      {/* Drop preview: filled ghost following the pointer's snapped position. */}
                      {ghostHere?.start && ghostHere.end && (
                        <div
                          className="scheduler-drag-ghost"
                          style={
                            {
                              top: `${api.getTimePercent(ghostHere.start) * 100}%`,
                              height: `${(api.getTimePercent(ghostHere.end) - api.getTimePercent(ghostHere.start)) * 100}%`,
                              insetInlineStart: "2px",
                              insetInlineEnd: "2px",
                              ["--event-color"]: ghostColor(ghostHere.eventId),
                            } as React.CSSProperties
                          }
                        >
                          <div className="scheduler-event-title">
                            {api.getEventById(ghostHere.eventId)?.title ?? ""}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
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
