import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronLeft, ChevronRight } from "lucide-solid"
import { Index, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/scheduler.css"

const TODAY = schedulerAnchor
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
  const [count, setCount] = createSignal(1000)
  const [events, setEvents] = createSignal(generate(count()))

  const update = (d: { event: scheduler.SchedulerEvent; newStart: any; newEnd: any }) =>
    setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e)))

  const id = createUniqueId()
  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>(() => ({
      id,
      defaultDate: schedulerAnchor,
      events: events(),
      onEventDrop: update,
      onEventResize: update,
    })),
  )

  const api = createMemo(() => scheduler.connect(service, normalizeProps))

  return (
    <>
      <main class="scheduler">
        <div {...api().getRootProps()}>
          <div {...api().getHeaderProps()}>
            <button {...api().getPrevTriggerProps()}>
              <ChevronLeft />
            </button>
            <button {...api().getTodayTriggerProps()}>Today</button>
            <button {...api().getNextTriggerProps()}>
              <ChevronRight />
            </button>
            <span {...api().getHeaderTitleProps()}>{api().visibleRangeText.formatted}</span>
            <span style={{ "margin-inline-start": "auto", "font-size": "12px", color: "#6b7280" }}>
              {events().length.toLocaleString()} events ({api().getEventsForDay.name ? "O(1) lookups" : ""})
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
              <Index each={[100, 500, 1000, 2500, 5000]}>{(n) => <option value={n()}>{n()} events</option>}</Index>
            </select>
          </div>

          <div class="scheduler-time-grid-wrapper">
            <div {...api().getColumnHeadersProps()}>
              <div class="scheduler-gutter-header" />
              <Index each={api().visibleDays}>
                {(date) => (
                  <div {...api().getColumnHeaderProps({ date: date() })}>
                    <span class="scheduler-header-day-label">{api().formatWeekDay(date())}</span>
                    <span class="scheduler-header-day-num">{date().day}</span>
                  </div>
                )}
              </Index>
            </div>

            <div class="scheduler-time-grid-scroll" tabIndex={0} role="group" aria-label="Time grid">
              <div {...api().getGridProps()}>
                <div {...api().getGridRowProps()}>
                  <div {...api().getTimeGutterProps()}>
                    <Index each={api().hourRange.hours}>
                      {(hour) => <div {...api().getHourLabelProps({ hour: hour() })}>{hour().label}</div>}
                    </Index>
                  </div>

                  <Index each={api().visibleDays}>
                    {(date) => (
                      <div {...api().getDayColumnProps({ date: date() })}>
                        <Index each={api().hourRange.hours}>
                          {(hour) => <div {...api().getHourLineProps({ hour: hour() })} />}
                        </Index>
                        <div {...api().getCurrentTimeIndicatorProps({ date: date() })} />
                        <Index each={api().getEventsForDay(date())}>
                          {(event) => (
                            <div {...api().getEventProps({ event: event() })}>
                              <div class="scheduler-event-title">{event().title}</div>
                              <div {...api().getEventResizeHandleProps({ event: event(), edge: "end" })}>
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
        </div>
      </main>
      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
