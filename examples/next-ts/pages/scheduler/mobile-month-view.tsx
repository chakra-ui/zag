import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, useMachine } from "@zag-js/react"
import { schedulerControls } from "@zag-js/shared"
import type { DateValue } from "@internationalized/date"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

const TODAY = scheduler.getToday()

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Team standup",
    start: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 0 }),
    end: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 30 }),
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Design review",
    start: TODAY.subtract({ days: 2 }).set({ hour: 10, minute: 0 }),
    end: TODAY.subtract({ days: 2 }).set({ hour: 11, minute: 30 }),
    color: "#10b981",
  },
  {
    id: "3",
    title: "Lunch",
    start: TODAY.set({ hour: 12, minute: 0 }),
    end: TODAY.set({ hour: 13, minute: 0 }),
    color: "#f59e0b",
  },
  {
    id: "4",
    title: "1:1 with manager",
    start: TODAY.set({ hour: 15, minute: 0 }),
    end: TODAY.set({ hour: 16, minute: 0 }),
    color: "#8b5cf6",
  },
  {
    id: "5",
    title: "Demo day",
    start: TODAY.add({ days: 7 }).set({ hour: 14, minute: 0 }),
    end: TODAY.add({ days: 7 }).set({ hour: 15, minute: 30 }),
    color: "#ef4444",
  },
]

export default function Page() {
  const controls = useControls(schedulerControls)
  const [selectedDate, setSelectedDate] = useState<DateValue>(TODAY)

  const { view: _view, ...controlsRest } = controls.context as any
  const service = useMachine(scheduler.machine, {
    id: useId(),
    ...controlsRest,
    view: "month",
    events: INITIAL,
  })

  const api = scheduler.connect(service, normalizeProps)
  const weeks = api.getMonthGrid(api.date)
  const selectedDayEvents = api.getEventsForDay(selectedDate)

  return (
    <>
      <main className="scheduler">
        <div {...api.getRootProps()} style={{ maxWidth: 420 }}>
          <div {...api.getHeaderProps()}>
            <button {...api.getPrevTriggerProps()}>{api.prevTriggerIcon}</button>
            <span {...api.getHeaderTitleProps()}>
              {new Date(api.date.year, api.date.month - 1, api.date.day).toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button {...api.getNextTriggerProps()}>{api.nextTriggerIcon}</button>
          </div>

          <div className="scheduler-mobile-month">
            <div className="scheduler-mobile-weekdays">
              {api.weekDays.map((d, i) => (
                <div key={i}>{d.short}</div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="scheduler-mobile-week">
                {week.map((cell) => {
                  const isSelected = cell.date.compare(selectedDate) === 0
                  const dayEvents = api.getEventsForDay(cell.date)
                  return (
                    <button
                      key={cell.date.toString()}
                      type="button"
                      {...api.getDayCellProps({ date: cell.date, referenceDate: api.date })}
                      className="scheduler-mobile-day"
                      data-selected={isSelected || undefined}
                      onClick={() => setSelectedDate(cell.date)}
                      aria-label={api.formatLongDate(cell.date)}
                    >
                      <span className="scheduler-mobile-day-num">{cell.date.day}</span>
                      <span className="scheduler-mobile-dots">
                        {dayEvents.slice(0, 3).map((e) => (
                          <span
                            key={e.id}
                            className="scheduler-mobile-dot"
                            style={{ background: e.color ?? "#3b82f6" }}
                          />
                        ))}
                      </span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          <div className="scheduler-mobile-agenda">
            <div className="scheduler-mobile-agenda-title">{api.formatLongDate(selectedDate)}</div>
            {selectedDayEvents.length === 0 ? (
              <div className="scheduler-mobile-agenda-empty">No events</div>
            ) : (
              selectedDayEvents.map((event) => (
                <div
                  key={event.id}
                  {...api.getEventProps({ event })}
                  className="scheduler-mobile-agenda-event"
                  style={{ ["--event-color"]: event.color ?? "#3b82f6" } as React.CSSProperties}
                >
                  <div className="scheduler-mobile-agenda-time">{api.formatTimeRange(event.start, event.end)}</div>
                  <div className="scheduler-event-title">{event.title}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
