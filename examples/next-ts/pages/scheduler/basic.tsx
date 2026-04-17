import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, useMachine } from "@zag-js/react"
import { CalendarDateTime } from "@internationalized/date"
import { useId } from "react"

const today = new CalendarDateTime(2026, 4, 17, 0, 0)

const INITIAL_EVENTS: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Team standup",
    start: new CalendarDateTime(2026, 4, 17, 9, 0),
    end: new CalendarDateTime(2026, 4, 17, 9, 30),
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Design review",
    start: new CalendarDateTime(2026, 4, 17, 10, 0),
    end: new CalendarDateTime(2026, 4, 17, 11, 30),
    color: "#10b981",
  },
  {
    id: "3",
    title: "Lunch",
    start: new CalendarDateTime(2026, 4, 17, 12, 0),
    end: new CalendarDateTime(2026, 4, 17, 13, 0),
    color: "#f59e0b",
  },
  {
    id: "4",
    title: "Overlapping meeting",
    start: new CalendarDateTime(2026, 4, 17, 9, 15),
    end: new CalendarDateTime(2026, 4, 17, 10, 15),
    color: "#ef4444",
  },
]

export default function Page() {
  const service = useMachine(scheduler.machine, {
    id: useId(),
    defaultView: "week",
    defaultDate: today,
    events: INITIAL_EVENTS,
    onSlotSelect(details) {
      console.log("slot selected", details)
    },
    onEventClick(details) {
      console.log("event clicked", details.event.title)
    },
    onEventDrop(details) {
      console.log("event dropped", details)
    },
    onEventResize(details) {
      console.log("event resized", details)
    },
  })

  const api = scheduler.connect(service, normalizeProps)

  return (
    <main {...api.getRootProps()} style={{ fontFamily: "sans-serif", padding: "1rem" }}>
      <div
        {...api.getHeaderProps()}
        style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}
      >
        <button {...api.getPrevTriggerProps()}>←</button>
        <button {...api.getTodayTriggerProps()}>Today</button>
        <button {...api.getNextTriggerProps()}>→</button>
        <span {...api.getHeaderTitleProps()} style={{ fontWeight: "bold", margin: "0 1rem" }}>
          {api.visibleRange.start.toString()} – {api.visibleRange.end.toString()}
        </span>
        <div {...api.getViewSelectProps()}>
          {(["day", "week", "month"] as scheduler.ViewType[]).map((v) => (
            <button
              key={v}
              onClick={() => api.setView(v)}
              style={{ fontWeight: api.view === v ? "bold" : "normal", marginRight: "0.25rem" }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div
        {...api.getGridProps()}
        style={{
          position: "relative",
          height: "600px",
          border: "1px solid #e5e7eb",
          borderRadius: "0.5rem",
          overflow: "hidden",
        }}
      >
        {INITIAL_EVENTS.map((event) => {
          const eventProps = api.getEventProps({ event })
          const eventStyle: React.CSSProperties = {
            background: event.color ?? "#3b82f6",
            color: "#fff",
            borderRadius: "4px",
            padding: "2px 4px",
            fontSize: "12px",
            overflow: "hidden",
            cursor: "grab",
            boxSizing: "border-box",
          }
          return (
            <div key={event.id} {...eventProps} style={eventStyle}>
              {event.title}
              <div
                {...api.getEventResizeHandleProps({ event, edge: "end" })}
                style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "6px", cursor: "ns-resize" }}
              />
            </div>
          )
        })}
      </div>

      <p style={{ marginTop: "0.5rem", color: "#6b7280", fontSize: "12px" }}>
        View: {api.view} | Date: {api.date.toString()}
      </p>
    </main>
  )
}
