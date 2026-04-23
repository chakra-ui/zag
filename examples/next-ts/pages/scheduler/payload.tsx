import * as popover from "@zag-js/popover"
import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { schedulerControls } from "@zag-js/shared"
import { useId, useRef, useState } from "react"
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
  const anchorRef = useRef<HTMLElement | null>(null)

  const schedulerService = useMachine(scheduler.machine as scheduler.Machine<MeetingPayload>, {
    id: useId(),
    ...controls.context,
    events,
    onEventDragEnd: (d) => setEvents(d.apply),
    onEventResizeEnd: (d) => setEvents(d.apply),
    onEventClick: (d) => {
      const el = document.getElementById(`scheduler:${schedulerService.scope.id}:event:${d.event.id}`)
      anchorRef.current = el
      setSelectedId(d.event.id)
      popoverApi.setOpen(true)
      popoverApi.reposition()
    },
  })

  const api = scheduler.connect(schedulerService, normalizeProps)
  const { visibleDays, hourRange, weekDays } = api

  const popoverService = useMachine(popover.machine, {
    id: useId(),
    positioning: {
      placement: "right",
      gutter: 8,
      getAnchorRect: () => {
        const el = anchorRef.current
        if (!el) return null
        const r = el.getBoundingClientRect()
        return { x: r.x, y: r.y, width: r.width, height: r.height }
      },
    },
    onOpenChange: (details) => {
      if (!details.open) setSelectedId(null)
    },
  })
  const popoverApi = popover.connect(popoverService, normalizeProps)

  const selected = selectedId ? (api.getEventById(selectedId) ?? null) : null

  return (
    <>
      <main className="scheduler">
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
                      {origin && <div {...origin.props} />}
                      {ghost && (
                        <div {...ghost.props}>
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

        <Portal>
          <div {...popoverApi.getPositionerProps()}>
            <div {...popoverApi.getContentProps()} className="scheduler-event-popover">
              {selected && selected.payload ? (
                <div
                  className="scheduler-event-popover-body"
                  style={{ ["--event-color"]: selected.color } as React.CSSProperties}
                >
                  <div className="scheduler-event-popover-row">
                    <span aria-hidden className="scheduler-event-popover-dot" />
                    <strong className="scheduler-event-popover-title">{selected.title}</strong>
                  </div>
                  <div className="scheduler-event-popover-time">
                    {api.formatTimeRange(selected.start, selected.end)} ·{" "}
                    {api.formatDuration(selected.start, selected.end)}
                  </div>
                  <div className="scheduler-event-popover-meta">
                    <div>
                      <span className="scheduler-event-popover-label">Attendees</span>
                      <div>{selected.payload.attendees.join(", ")}</div>
                    </div>
                    <div>
                      <span className="scheduler-event-popover-label">Location</span>
                      <div>{selected.payload.location}</div>
                    </div>
                    {selected.payload.meetingUrl && (
                      <a
                        href={selected.payload.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="scheduler-event-popover-link"
                      >
                        Join meeting →
                      </a>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Portal>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={schedulerService} />
      </Toolbar>
    </>
  )
}
