import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

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

  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>(() => ({
      id: createUniqueId(),
      events: INITIAL,
      maxRecurrenceInstances: 500,
    })),
  )

  const api = createMemo(() => scheduler.connect(service, normalizeProps))

  return (
    <>
      <main class="scheduler">
        <div {...api().getRootProps()}>
          <div {...api().getHeaderProps()}>
            <button {...api().getPrevTriggerProps()}>{api().prevTriggerIcon}</button>
            <button {...api().getTodayTriggerProps()}>{api().todayTriggerLabel}</button>
            <button {...api().getNextTriggerProps()}>{api().nextTriggerIcon}</button>
            <span {...api().getHeaderTitleProps()}>
              {api().visibleRangeText.formatted} · {api().events.length} expanded events
            </span>
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
