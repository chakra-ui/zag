import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, useMachine } from "@zag-js/react"
import { schedulerControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

const TODAY = scheduler.getToday()

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "weekly-standup",
    title: "Weekly standup",
    start: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 0 }),
    end: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 30 }),
    color: "#3b82f6",
    recurrence: { freq: "weekly" },
  },
  {
    id: "biweekly-sync",
    title: "Biweekly team sync",
    start: TODAY.subtract({ days: 3 }).set({ hour: 11, minute: 0 }),
    end: TODAY.subtract({ days: 3 }).set({ hour: 12, minute: 0 }),
    color: "#10b981",
    recurrence: { freq: "weekly", interval: 2, count: 8 },
  },
  {
    id: "one-off",
    title: "Quarterly review",
    start: TODAY.subtract({ days: 2 }).set({ hour: 14, minute: 0 }),
    end: TODAY.subtract({ days: 2 }).set({ hour: 15, minute: 0 }),
    color: "#f59e0b",
  },
]

export default function Page() {
  const controls = useControls(schedulerControls)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    ...controls.context,
    events: INITIAL,
    maxRecurrenceInstances: 500,
  })

  const api = scheduler.connect(service, normalizeProps)
  const { visibleDays, hourRange, weekDays } = api

  return (
    <>
      <main className="scheduler">
        <div {...api.getRootProps()}>
          <div {...api.getHeaderProps()}>
            <button {...api.getPrevTriggerProps()}>{api.prevTriggerIcon}</button>
            <button {...api.getTodayTriggerProps()}>{api.todayTriggerLabel}</button>
            <button {...api.getNextTriggerProps()}>{api.nextTriggerIcon}</button>
            <span {...api.getHeaderTitleProps()}>
              {api.visibleRangeText.formatted} · {api.events.length} expanded events
            </span>
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

                {visibleDays.map((d) => (
                  <div key={d.toString()} {...api.getDayColumnProps({ date: d })}>
                    {hourRange.hours.map((h) => (
                      <div key={h.value} className="scheduler-hour-line" style={h.style} />
                    ))}
                    {api.getEventsForDay(d).map((event) => (
                      <div
                        key={event.id}
                        {...api.getEventProps({ event })}
                        style={
                          {
                            ...api.getEventStyle(event),
                            ["--event-color"]: event.color,
                          } as React.CSSProperties
                        }
                      >
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
