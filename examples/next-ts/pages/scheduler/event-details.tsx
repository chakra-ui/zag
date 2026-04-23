// Click an event to open a popover anchored to that event element showing
// its details, with minimal rename + delete actions. Demonstrates wiring
// scheduler's onEventClick into a controlled popover via getAnchorRect.
import * as popover from "@zag-js/popover"
import * as scheduler from "@zag-js/scheduler"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { schedulerControls } from "@zag-js/shared"
import { useId, useRef, useState, type KeyboardEvent } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

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
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const anchorRef = useRef<HTMLElement | null>(null)
  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState("")

  const schedulerService = useMachine(scheduler.machine, {
    id: useId(),
    ...controls.context,
    events,
    onEventDrop: (d) =>
      setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
    onEventResize: (d) =>
      setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
    onEventClick: (d) => {
      const el = document.getElementById(`scheduler:${schedulerService.scope.id}:event:${d.event.id}`)
      anchorRef.current = el
      setSelectedId(d.event.id)
      setEditing(false)
      setDraftTitle(d.event.title)
      popoverApi.setOpen(true)
      popoverApi.reposition()
    },
  })

  const api = scheduler.connect(schedulerService, normalizeProps)

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
      if (!details.open) {
        setSelectedId(null)
        setEditing(false)
      }
    },
  })
  const popoverApi = popover.connect(popoverService, normalizeProps)

  const selectedEvent = selectedId ? api.getEventById(selectedId) : undefined

  function commitRename() {
    if (!selectedId) return
    const trimmed = draftTitle.trim()
    if (!trimmed) {
      setEditing(false)
      return
    }
    setEvents((prev) => prev.map((e) => (e.id === selectedId ? { ...e, title: trimmed } : e)))
    setEditing(false)
  }

  function handleRenameKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      commitRename()
    } else if (e.key === "Escape") {
      e.preventDefault()
      setEditing(false)
      if (selectedEvent) setDraftTitle(selectedEvent.title)
    }
  }

  function handleDelete() {
    if (!selectedId) return
    setEvents((prev) => prev.filter((e) => e.id !== selectedId))
    popoverApi.setOpen(false)
  }

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
          </div>

          <div className="scheduler-time-grid-wrapper">
            <div className="scheduler-col-headers">
              <div className="scheduler-header-cell scheduler-gutter-header" />
              {api.visibleDays.map((date, i) => (
                <div key={date.toString()} className="scheduler-header-cell">
                  <span className="scheduler-header-day-label">{api.weekDays[i % 7].short}</span>
                  <span className="scheduler-header-day-num">{date.day}</span>
                </div>
              ))}
            </div>

            <div className="scheduler-time-grid-scroll">
              <div {...api.getGridProps()} className="scheduler-time-grid">
                <div {...api.getTimeGutterProps()}>
                  {api.hourRange.hours.map((hour) => (
                    <div key={hour.value} className="scheduler-hour-label" style={hour.style}>
                      {hour.label}
                    </div>
                  ))}
                </div>

                {api.visibleDays.map((date) => (
                  <div key={date.toString()} {...api.getDayColumnProps({ date })}>
                    {api.hourRange.hours.map((hour) => (
                      <div key={hour.value} className="scheduler-hour-line" style={hour.style} />
                    ))}
                    <div {...api.getCurrentTimeIndicatorProps({ date })} />
                    {api.getEventsForDay(date).map((event) => (
                      <div key={event.id} {...api.getEventProps({ event })}>
                        <div className="scheduler-event-title">{event.title}</div>
                        <div
                          {...api.getEventResizeHandleProps({ event, edge: "end" })}
                          className="scheduler-resize-handle"
                        >
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

        <Portal>
          <div {...popoverApi.getPositionerProps()}>
            <div {...popoverApi.getContentProps()} className="scheduler-event-popover">
              {selectedEvent ? (
                <div
                  className="scheduler-event-popover-body"
                  style={{ ["--event-color"]: selectedEvent.color } as React.CSSProperties}
                >
                  <div className="scheduler-event-popover-row">
                    <span aria-hidden className="scheduler-event-popover-dot" />
                    {editing ? (
                      <input
                        autoFocus
                        className="scheduler-event-popover-title"
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={handleRenameKey}
                      />
                    ) : (
                      <strong className="scheduler-event-popover-title">{selectedEvent.title}</strong>
                    )}
                  </div>
                  <div className="scheduler-event-popover-time">
                    {api.formatTimeRange(selectedEvent.start, selectedEvent.end)}
                  </div>
                  <div className="scheduler-event-popover-duration">
                    Duration: {api.formatDuration(selectedEvent.start, selectedEvent.end)}
                  </div>
                  <div className="scheduler-event-popover-actions">
                    <button type="button" onClick={() => setEditing((v) => !v)}>
                      {editing ? "Done" : "Edit"}
                    </button>
                    <button type="button" onClick={handleDelete}>
                      Delete
                    </button>
                    <button type="button" {...popoverApi.getCloseTriggerProps()} data-close>
                      Close
                    </button>
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
