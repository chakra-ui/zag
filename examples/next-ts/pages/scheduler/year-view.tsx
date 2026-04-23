import * as scheduler from "@zag-js/scheduler"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { normalizeProps, useMachine } from "@zag-js/react"
import { CalendarDateTime } from "@internationalized/date"
import { schedulerControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

// A meeting on the 10th-ish of every month, so each mini-month tile has content.
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
    <div className="scheduler-mini-month">
      <div className="scheduler-mini-month-title">{api.getMonthName(reference)}</div>
      <div className="scheduler-mini-weekdays">
        {api.weekDays.map((day, i) => (
          <div key={i}>{day.narrow}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="scheduler-mini-week">
          {week.map((cell) => {
            const dayEvents = api.getEventsForDay(cell.date)
            return (
              <div
                key={cell.date.toString()}
                {...api.getDayCellProps({ date: cell.date, referenceDate: reference })}
                className="scheduler-mini-day"
              >
                <span>{cell.date.day}</span>
                {dayEvents.length > 0 && (
                  <span className="scheduler-mini-dot" style={{ background: dayEvents[0].color ?? "#3b82f6" }} />
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function Page() {
  const controls = useControls(schedulerControls)
  const { view: _view, ...controlsRest } = controls.context as any
  const service = useMachine(scheduler.machine, {
    id: useId(),
    defaultDate: INITIAL[0].start,
    ...controlsRest,
    view: "year",
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
            <button {...api.getTodayTriggerProps()}>{api.todayTriggerLabel}</button>
            <button {...api.getNextTriggerProps()}>
              <ChevronRight />
            </button>
            <span {...api.getHeaderTitleProps()}>{api.date.year}</span>
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
