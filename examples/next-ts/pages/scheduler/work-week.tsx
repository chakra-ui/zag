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
    title: "Daily standup",
    start: TODAY.subtract({ days: 2 }).set({ hour: 9, minute: 30 }),
    end: TODAY.subtract({ days: 2 }).set({ hour: 10, minute: 0 }),
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Design review",
    start: TODAY.subtract({ days: 1 }).set({ hour: 11, minute: 0 }),
    end: TODAY.subtract({ days: 1 }).set({ hour: 12, minute: 30 }),
    color: "#10b981",
  },
  {
    id: "3",
    title: "Friday demo",
    start: TODAY.add({ days: 2 }).set({ hour: 15, minute: 0 }),
    end: TODAY.add({ days: 2 }).set({ hour: 16, minute: 0 }),
    color: "#f59e0b",
  },
]

export default function Page() {
  const controls = useControls(schedulerControls)
  const [events, setEvents] = useState(INITIAL)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    startOfWeek: 1,
    workWeekDays: [1, 2, 3, 4, 5],
    workWeekOnly: true,
    ...controls.context,
    events,
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
            <span {...api.getHeaderTitleProps()}>Work Week · {api.visibleRangeText.formatted}</span>
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
