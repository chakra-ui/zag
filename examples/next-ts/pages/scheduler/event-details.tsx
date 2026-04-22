// Click an event to open a popover anchored to that event element showing
// its details, with minimal rename + delete actions. Demonstrates wiring
// scheduler's onEventClick into a controlled popover via getAnchorRect.
import * as popover from "@zag-js/popover"
import * as scheduler from "@zag-js/scheduler"
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

function toMinutes(d: scheduler.SchedulerEvent["start"]) {
  const hour = "hour" in d ? d.hour : 0
  const minute = "minute" in d ? d.minute : 0
  return { hour, minute, total: hour * 60 + minute }
}

function formatDuration(start: scheduler.SchedulerEvent["start"], end: scheduler.SchedulerEvent["end"]) {
  const diff = Math.max(0, toMinutes(end).total - toMinutes(start).total)
  const h = Math.floor(diff / 60)
  const m = diff % 60
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h}h`
  return `${m}m`
}

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
    onEventDrop: (d) => setEvents(d.apply),
    onEventResize: (d) => setEvents(d.apply),
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

        <Portal>
          <div {...popoverApi.getPositionerProps()}>
            <div
              {...popoverApi.getContentProps()}
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                padding: 12,
                minWidth: 240,
                fontSize: 13,
              }}
            >
              {selectedEvent ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      aria-hidden
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: selectedEvent.color ?? "#6b7280",
                        flexShrink: 0,
                      }}
                    />
                    {editing ? (
                      <input
                        autoFocus
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={handleRenameKey}
                        style={{ flex: 1, font: "inherit", padding: "2px 4px" }}
                      />
                    ) : (
                      <strong style={{ flex: 1 }}>{selectedEvent.title}</strong>
                    )}
                  </div>
                  <div style={{ color: "#4b5563" }}>{api.formatTimeRange(selectedEvent.start, selectedEvent.end)}</div>
                  <div style={{ color: "#6b7280" }}>
                    Duration: {formatDuration(selectedEvent.start, selectedEvent.end)}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    <button type="button" onClick={() => setEditing((v) => !v)}>
                      {editing ? "Done" : "Edit"}
                    </button>
                    <button type="button" onClick={handleDelete}>
                      Delete
                    </button>
                    <button type="button" {...popoverApi.getCloseTriggerProps()} style={{ marginLeft: "auto" }}>
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
