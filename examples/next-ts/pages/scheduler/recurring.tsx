import * as scheduler from "@zag-js/scheduler"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { normalizeProps, useMachine } from "@zag-js/react"
import { schedulerControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

const TODAY = scheduler.getToday()

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "mwf-meeting",
    title: "MWF standup",
    start: TODAY.subtract({ days: 7 }).set({ hour: 9, minute: 0 }),
    end: TODAY.subtract({ days: 7 }).set({ hour: 9, minute: 30 }),
    color: "#3b82f6",
    recurrence: { rrule: "FREQ=WEEKLY;BYDAY=MO,WE,FR" },
  },
  {
    id: "biweekly-sync",
    title: "Biweekly team sync",
    start: TODAY.subtract({ days: 3 }).set({ hour: 11, minute: 0 }),
    end: TODAY.subtract({ days: 3 }).set({ hour: 12, minute: 0 }),
    color: "#10b981",
    recurrence: { rrule: "FREQ=WEEKLY;INTERVAL=2;BYDAY=TU;COUNT=8" },
  },
  {
    id: "first-monday",
    title: "First-Monday review",
    start: TODAY.set({ day: 1, hour: 14, minute: 0 }),
    end: TODAY.set({ day: 1, hour: 15, minute: 0 }),
    color: "#8b5cf6",
    recurrence: { rrule: "FREQ=MONTHLY;BYDAY=1MO" },
  },
  {
    id: "month-15",
    title: "Invoice day",
    start: TODAY.set({ day: 15, hour: 10, minute: 0 }),
    end: TODAY.set({ day: 15, hour: 10, minute: 30 }),
    color: "#ec4899",
    recurrence: { rrule: "FREQ=MONTHLY;BYMONTHDAY=15" },
  },
  {
    id: "one-off",
    title: "Quarterly review",
    start: TODAY.subtract({ days: 2 }).set({ hour: 16, minute: 0 }),
    end: TODAY.subtract({ days: 2 }).set({ hour: 17, minute: 0 }),
    color: "#f59e0b",
  },
]

export default function Page() {
  const controls = useControls(schedulerControls)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    ...controls.context,
    events: INITIAL,
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
            <span {...api.getHeaderTitleProps()}>
              {api.visibleRangeText.formatted} · {api.events.length} expanded events
            </span>
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
