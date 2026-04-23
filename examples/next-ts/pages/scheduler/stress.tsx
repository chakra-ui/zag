import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, useMachine } from "@zag-js/react"
import { schedulerControls } from "@zag-js/shared"
import { useId, useMemo, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

const TODAY = scheduler.getToday()
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"]

function seededRandom(seed: number) {
  // Deterministic PRNG so the benchmark is reproducible across reloads.
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function generate(count: number): scheduler.SchedulerEvent[] {
  const rand = seededRandom(count)
  const out: scheduler.SchedulerEvent[] = []
  for (let i = 0; i < count; i++) {
    // Spread across ~90 days centered on today so every visible range has
    // hundreds of events without creating impossibly packed days.
    const dayOffset = Math.floor(rand() * 90) - 45
    const startHour = 7 + Math.floor(rand() * 12) // 7..18
    const startMin = rand() < 0.5 ? 0 : 30
    const durationMin = 30 + Math.floor(rand() * 4) * 30 // 30..120
    const start = TODAY.add({ days: dayOffset }).set({ hour: startHour, minute: startMin })
    const end = start.add({ minutes: durationMin })
    out.push({
      id: `e-${i}`,
      title: `Meeting ${i}`,
      start,
      end,
      color: COLORS[i % COLORS.length],
    })
  }
  return out
}

export default function Page() {
  const controls = useControls(schedulerControls)
  const [count, setCount] = useState(1000)
  const events = useMemo(() => generate(count), [count])
  const [, setTick] = useState(0)
  const service = useMachine(scheduler.machine, {
    id: useId(),
    ...controls.context,
    events,
    onEventDragEnd: (d) => {
      // Exercise the apply path end-to-end — parent re-renders with a fresh
      // event list. The machine's O(1) lookups keep this smooth.
      events.splice(0, events.length, ...d.apply(events))
      setTick((t) => t + 1)
    },
    onEventResizeEnd: (d) => {
      events.splice(0, events.length, ...d.apply(events))
      setTick((t) => t + 1)
    },
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
            <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
            <span style={{ marginInlineStart: "auto", fontSize: 12, color: "#6b7280" }}>
              {events.length.toLocaleString()} events ({api.getEventsForDay.name ? "O(1) lookups" : ""})
            </span>
            <select value={count} onChange={(e) => setCount(Number(e.currentTarget.value))} style={{ marginLeft: 8 }}>
              {[100, 500, 1000, 2500, 5000].map((n) => (
                <option key={n} value={n}>
                  {n} events
                </option>
              ))}
            </select>
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
                        <div
                          {...api.getEventResizeHandleProps({ event, edge: "end" })}
                          className="scheduler-resize-handle"
                        >
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
