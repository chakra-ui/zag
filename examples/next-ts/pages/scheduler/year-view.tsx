import { CalendarDateTime } from "@internationalized/date"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

const INITIAL: scheduler.SchedulerEvent[] = Array.from({ length: 12 }, (_, m) => ({
  id: `evt-${m}`,
  title: `Meeting ${m + 1}`,
  start: new CalendarDateTime(2026, m + 1, 10 + (m % 15), 10, 0),
  end: new CalendarDateTime(2026, m + 1, 10 + (m % 15), 11, 0),
  color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][m % 5],
}))

function MiniMonth({ api, month }: { api: scheduler.Api; month: number }) {
  const reference = api.date.set({ month, day: 1 })
  const weeks = api.getMonthGrid(reference)
  return (
    <section className="scheduler-mini-month">
      <h3 className="scheduler-mini-month-title">{api.getMonthName(reference)}</h3>
      <div {...api.getMonthGridProps({ date: reference })}>
        <div {...api.getWeekdayHeaderRowProps()} className="scheduler-mini-weekdays">
          {api.weekDays.map((day) => (
            <div key={day.long} {...api.getWeekdayHeaderCellProps({ day })}>
              {day.narrow}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} {...api.getWeekRowProps()} className="scheduler-mini-week">
            {week.map((date) => {
              const dayEvents = api.getEventsForDay(date)
              return (
                <div key={date.toString()} {...api.getDayCellProps({ date, referenceDate: reference })}>
                  <div
                    {...api.getDayCellTriggerProps({ date, referenceDate: reference })}
                    className="scheduler-mini-day"
                  >
                    <span aria-hidden>{date.day}</span>
                    {dayEvents.length > 0 && (
                      <span
                        aria-hidden
                        className="scheduler-mini-dot"
                        style={{ background: dayEvents[0].color ?? "#3b82f6" }}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Page() {
  const controls = useControls(schedulerControls)
  const service = useMachine(scheduler.machine, {
    id: useId(),
    defaultDate: INITIAL[0].start,
    startOfWeek: 1,
    ...controls.context,
    view: "year",
    events: INITIAL,
  })

  const api = scheduler.connect(service, normalizeProps)

  return (
    <>
      <main className="scheduler scheduler-year-page">
        <div {...api.getRootProps()}>
          <div {...api.getHeaderProps()}>
            <span {...api.getHeaderTitleProps()}>{api.date.year}</span>
            <div className="scheduler-year-nav">
              <button {...api.getPrevTriggerProps()} aria-label="Previous year">
                <ChevronLeft />
              </button>
              <button {...api.getTodayTriggerProps()}>Today</button>
              <button {...api.getNextTriggerProps()} aria-label="Next year">
                <ChevronRight />
              </button>
            </div>
          </div>

          <div className="scheduler-year-grid">
            {api.monthNames.map((_, i) => (
              <MiniMonth key={i} api={api} month={i + 1} />
            ))}
          </div>
        </div>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
