import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

const TODAY = scheduler.getToday()
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"]

function seededRandom(seed: number) {
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
    const dayOffset = Math.floor(rand() * 90) - 45
    const startHour = 7 + Math.floor(rand() * 12)
    const startMin = rand() < 0.5 ? 0 : 30
    const durationMin = 30 + Math.floor(rand() * 4) * 30
    const start = TODAY.add({ days: dayOffset }).set({ hour: startHour, minute: startMin })
    const end = start.add({ minutes: durationMin })
    out.push({ id: `e-${i}`, title: `Meeting ${i}`, start, end, color: COLORS[i % COLORS.length] })
  }
  return out
}

export default function Page() {
  const controls = useControls(schedulerControls)
  const [count, setCount] = createSignal(1000)
  const [events, setEvents] = createSignal<scheduler.SchedulerEvent[]>(generate(count()))

  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>(() => ({
      id: createUniqueId(),
      events: events(),
      onEventDragEnd: (d) => setEvents(d.apply(events())),
      onEventResizeEnd: (d) => setEvents(d.apply(events())),
    })),
  )
  const api = createMemo(() => scheduler.connect(service, normalizeProps))

  const sizeOptions = [100, 500, 1000, 2500, 5000]

  return (
    <>
      <main class="scheduler">
        <div {...api().getRootProps()}>
          <div {...api().getHeaderProps()}>
            <button {...api().getPrevTriggerProps()}>{api().prevTriggerIcon}</button>
            <button {...api().getTodayTriggerProps()}>{api().todayTriggerLabel}</button>
            <button {...api().getNextTriggerProps()}>{api().nextTriggerIcon}</button>
            <span {...api().getHeaderTitleProps()}>{api().visibleRangeText.formatted}</span>
            <span style={{ "margin-inline-start": "auto", "font-size": "12px", color: "#6b7280" }}>
              {events().length.toLocaleString()} events
            </span>
            <select
              value={count()}
              onChange={(e) => {
                const n = Number(e.currentTarget.value)
                setCount(n)
                setEvents(generate(n))
              }}
              style={{ "margin-left": "8px" }}
            >
              <Index each={sizeOptions}>{(n) => <option value={n()}>{n()} events</option>}</Index>
            </select>
          </div>

          <div class="scheduler-time-grid-wrapper">
            <div class="scheduler-col-headers">
              <div class="scheduler-header-cell scheduler-gutter-header" />
              <Index each={api().visibleDays}>
                {(d, i) => (
                  <div class="scheduler-header-cell">
                    <span class="scheduler-header-day-label">{api().weekDays[i % 7].short}</span>
                    <span class="scheduler-header-day-num">{d().day}</span>
                  </div>
                )}
              </Index>
            </div>

            <div class="scheduler-time-grid-scroll">
              <div {...api().getGridProps()} class="scheduler-time-grid">
                <div {...api().getTimeGutterProps()}>
                  <Index each={api().hourRange.hours}>
                    {(h) => (
                      <div class="scheduler-hour-label" style={h().style}>
                        {h().label}
                      </div>
                    )}
                  </Index>
                </div>

                <Index each={api().visibleDays}>
                  {(d) => (
                    <div {...api().getDayColumnProps({ date: d() })}>
                      <Index each={api().hourRange.hours}>
                        {(h) => <div class="scheduler-hour-line" style={h().style} />}
                      </Index>
                      <Index each={api().getEventsForDay(d())}>
                        {(event) => (
                          <div
                            {...api().getEventProps({ event: event() })}
                            style={{ ...api().getEventStyle(event()), "--event-color": event().color }}
                          >
                            <div class="scheduler-event-title">{event().title}</div>
                            <div
                              {...api().getEventResizeHandleProps({ event: event(), edge: "end" })}
                              class="scheduler-resize-handle"
                            >
                              <div class="scheduler-resize-grip" />
                            </div>
                          </div>
                        )}
                      </Index>
                    </div>
                  )}
                </Index>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
