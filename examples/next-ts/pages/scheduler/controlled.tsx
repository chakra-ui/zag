import { type DateValue } from "@internationalized/date"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

const TODAY = scheduler.getToday()

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Sprint planning",
    start: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 0 }),
    end: TODAY.subtract({ days: 4 }).set({ hour: 10, minute: 0 }),
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Interview",
    start: TODAY.subtract({ days: 3 }).set({ hour: 11, minute: 0 }),
    end: TODAY.subtract({ days: 3 }).set({ hour: 12, minute: 0 }),
    color: "#ef4444",
  },
  {
    id: "3",
    title: "1:1 with manager",
    start: TODAY.subtract({ days: 1 }).set({ hour: 14, minute: 0 }),
    end: TODAY.subtract({ days: 1 }).set({ hour: 14, minute: 30 }),
    color: "#10b981",
  },
]

export default function Page() {
  const controls = useControls(schedulerControls)
  const [view, setView] = useState<scheduler.ViewType>("week")
  const [date, setDate] = useState<DateValue>(TODAY)
  const [events, setEvents] = useState(INITIAL)
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    ...controls.context,
    view,
    date,
    events,
    onViewChange: (d) => setView(d.view),
    onDateChange: (d) => setDate(d.date),
    onEventClick: (d) => setSelectedTitle(d.event.title),
    onEventDrop: (d) =>
      setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
    onEventResize: (d) =>
      setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
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
              {(["day", "week"] as scheduler.ViewType[]).map((v) => (
                <button key={v} {...api.getViewItemProps({ view: v })}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
            View: <strong>{view}</strong> · {events.length} events
            {selectedTitle ? (
              <>
                {" · Selected: "}
                <strong>{selectedTitle}</strong>
              </>
            ) : null}
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

            <div className="scheduler-time-grid-scroll">
              <div {...api.getGridProps()}>
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
                    {api.getEventsForDay(date).map((event) => (
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
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
