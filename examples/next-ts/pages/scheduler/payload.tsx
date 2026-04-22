import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, useMachine } from "@zag-js/react"
import { schedulerControls } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

/**
 * Typed `payload` example. `SchedulerEvent<T>` threads a user-defined type
 * through `SchedulerProps<T>` and every callback detail, letting consumers
 * attach arbitrary metadata (attendees, location, links) with full type safety.
 */

interface MeetingPayload {
  attendees: string[]
  location: string
  meetingUrl?: string
}

const TODAY = scheduler.getToday()

const INITIAL: scheduler.SchedulerEvent<MeetingPayload>[] = [
  {
    id: "1",
    title: "Team standup",
    start: TODAY.subtract({ days: 1 }).set({ hour: 9, minute: 0 }),
    end: TODAY.subtract({ days: 1 }).set({ hour: 9, minute: 30 }),
    color: "#3b82f6",
    payload: {
      attendees: ["AB", "CD", "EF"],
      location: "Zoom",
      meetingUrl: "https://zoom.us/j/123",
    },
  },
  {
    id: "2",
    title: "Design review",
    start: TODAY.set({ hour: 10, minute: 0 }),
    end: TODAY.set({ hour: 11, minute: 30 }),
    color: "#10b981",
    payload: {
      attendees: ["GH", "IJ"],
      location: "Studio B",
    },
  },
  {
    id: "3",
    title: "Client sync",
    start: TODAY.add({ days: 2 }).set({ hour: 14, minute: 0 }),
    end: TODAY.add({ days: 2 }).set({ hour: 15, minute: 0 }),
    color: "#f59e0b",
    payload: {
      attendees: ["KL", "MN", "OP"],
      location: "Google Meet",
      meetingUrl: "https://meet.google.com/xyz",
    },
  },
]

const chipStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 18,
  height: 18,
  padding: "0 4px",
  marginRight: 2,
  borderRadius: 9,
  background: "rgba(255,255,255,0.35)",
  color: "inherit",
  fontSize: 10,
  fontWeight: 600,
}

const metaStyle: React.CSSProperties = {
  fontSize: 10,
  opacity: 0.85,
  marginTop: 2,
  display: "flex",
  gap: 6,
  alignItems: "center",
}

type Event = scheduler.SchedulerEvent<MeetingPayload>

export default function Page() {
  const controls = useControls(schedulerControls)
  const [events, setEvents] = useState<Event[]>(INITIAL)
  const [selected, setSelected] = useState<Event | null>(null)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    ...controls.context,
    events: events as unknown as scheduler.SchedulerEvent[],
    onEventDrop: (d) => setEvents(d.apply as unknown as (e: Event[]) => Event[]),
    onEventResize: (d) => setEvents(d.apply as unknown as (e: Event[]) => Event[]),
    onEventClick: (d) => {
      const event = d.event as unknown as Event
      console.log("payload:", event.payload)
      setSelected(event)
    },
  })

  const api = scheduler.connect(service, normalizeProps)
  const { visibleDays, hourRange, weekDays } = api

  return (
    <>
      <main className="scheduler">
        <div {...api.getRootProps()}>
          <div {...api.getHeaderProps()}>
            <button {...api.getPrevTriggerProps()}>{api.prevTriggerIcon}</button>
            <button {...api.getTodayTriggerProps()}>Today</button>
            <button {...api.getNextTriggerProps()}>{api.nextTriggerIcon}</button>
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
                  const ghost = api.getDragGhost({ date: d })
                  const origin = api.getDragOrigin({ date: d })
                  return (
                    <div key={d.toString()} {...api.getDayColumnProps({ date: d })}>
                      {hourRange.hours.map((h) => (
                        <div key={h.value} className="scheduler-hour-line" style={h.style} />
                      ))}
                      {(api.getEventsForDay(d) as unknown as Event[]).map((event) => (
                        <div
                          key={event.id}
                          {...api.getEventProps({ event: event as unknown as scheduler.SchedulerEvent })}
                        >
                          <div className="scheduler-event-title">{event.title}</div>
                          {event.payload && (
                            <>
                              <div>
                                {event.payload.attendees.map((a) => (
                                  <span key={a} style={chipStyle}>
                                    {a}
                                  </span>
                                ))}
                              </div>
                              <div style={metaStyle}>
                                <span>{event.payload.location}</span>
                                {event.payload.meetingUrl && <span>· Join</span>}
                              </div>
                            </>
                          )}
                          <div
                            {...api.getEventResizeHandleProps({
                              event: event as unknown as scheduler.SchedulerEvent,
                              edge: "end",
                            })}
                            className="scheduler-resize-handle"
                          >
                            <div className="scheduler-resize-grip" />
                          </div>
                        </div>
                      ))}
                      {origin && <div className="scheduler-drag-origin" style={origin.style as React.CSSProperties} />}
                      {ghost && (
                        <div className="scheduler-drag-ghost" style={ghost.style as React.CSSProperties}>
                          <div className="scheduler-event-title">{ghost.event.title}</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {selected && selected.payload && (
          <div style={{ marginTop: 16, padding: 12, border: "1px solid #e5e7eb", borderRadius: 6 }}>
            <strong>{selected.title}</strong>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              <div>Attendees: {selected.payload.attendees.join(", ")}</div>
              <div>Location: {selected.payload.location}</div>
              {selected.payload.meetingUrl && <div>URL: {selected.payload.meetingUrl}</div>}
            </div>
          </div>
        )}
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
