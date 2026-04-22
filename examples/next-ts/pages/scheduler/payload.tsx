import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, useMachine } from "@zag-js/react"
import { schedulerControls } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

interface MeetingPayload {
  attendees: string[]
  location: string
  meetingUrl?: string
}

type Event = scheduler.SchedulerEvent<MeetingPayload>

const TODAY = scheduler.getToday()

const INITIAL: Event[] = [
  {
    id: "1",
    title: "Team standup",
    start: TODAY.subtract({ days: 1 }).set({ hour: 9, minute: 0 }),
    end: TODAY.subtract({ days: 1 }).set({ hour: 9, minute: 30 }),
    color: "#3b82f6",
    payload: { attendees: ["Ada", "Ben", "Cai"], location: "Zoom", meetingUrl: "https://zoom.us/j/123" },
  },
  {
    id: "2",
    title: "Design review",
    start: TODAY.set({ hour: 10, minute: 0 }),
    end: TODAY.set({ hour: 11, minute: 30 }),
    color: "#10b981",
    payload: { attendees: ["Dee", "Eli"], location: "Studio B" },
  },
  {
    id: "3",
    title: "Client sync",
    start: TODAY.add({ days: 2 }).set({ hour: 14, minute: 0 }),
    end: TODAY.add({ days: 2 }).set({ hour: 15, minute: 0 }),
    color: "#f59e0b",
    payload: {
      attendees: ["Finn", "Gwen", "Hana"],
      location: "Google Meet",
      meetingUrl: "https://meet.google.com/xyz",
    },
  },
]

export default function Page() {
  const controls = useControls(schedulerControls)
  const [events, setEvents] = useState<Event[]>(INITIAL)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const service = useMachine(scheduler.machine as scheduler.Machine<MeetingPayload>, {
    id: useId(),
    ...controls.context,
    events,
    onEventDrop: (d) => setEvents(d.apply),
    onEventResize: (d) => setEvents(d.apply),
    onEventClick: (d) => setSelectedId(d.event.id),
  })

  const api = scheduler.connect(service, normalizeProps)
  const { visibleDays, hourRange, weekDays } = api
  const selected = selectedId ? (api.getEventById(selectedId) ?? null) : null

  return (
    <>
      <main className="scheduler scheduler-with-aside">
        <div {...api.getRootProps()}>
          <div {...api.getHeaderProps()}>
            <button {...api.getPrevTriggerProps()}>{api.prevTriggerIcon}</button>
            <button {...api.getTodayTriggerProps()}>{api.todayTriggerLabel}</button>
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
                      {api.getEventsForDay(d).map((event) => (
                        <div key={event.id} {...api.getEventProps({ event })}>
                          <div className="scheduler-event-title">{event.title}</div>
                          {event.payload && (
                            <div className="scheduler-event-meta">
                              {event.payload.attendees.length} · {event.payload.location}
                            </div>
                          )}
                          <div
                            {...api.getEventResizeHandleProps({ event, edge: "end" })}
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

        <aside className="scheduler-event-panel">
          {selected && selected.payload ? (
            <>
              <div className="scheduler-event-panel-title">{selected.title}</div>
              <div className="scheduler-event-panel-time">{api.formatTimeRange(selected.start, selected.end)}</div>
              <div className="scheduler-event-panel-section">
                <div className="scheduler-event-panel-section-label">Attendees</div>
                <div>{selected.payload.attendees.join(", ")}</div>
              </div>
              <div className="scheduler-event-panel-row">
                <span className="scheduler-event-panel-row-label">Location: </span>
                {selected.payload.location}
              </div>
              {selected.payload.meetingUrl && (
                <a
                  href={selected.payload.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="scheduler-event-panel-link"
                >
                  Join meeting →
                </a>
              )}
            </>
          ) : (
            <div className="scheduler-event-panel-empty">Click an event to see its typed payload.</div>
          )}
        </aside>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
