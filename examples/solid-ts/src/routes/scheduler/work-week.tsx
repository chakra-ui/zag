import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

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
  const [events, setEvents] = createSignal<scheduler.SchedulerEvent[]>(INITIAL)

  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>(() => ({
      id: createUniqueId(),
      weekStartDay: 1,
      workWeekDays: [1, 2, 3, 4, 5],
      workWeekOnly: true,
      events: events(),
      onEventDragEnd: (d) => setEvents(d.apply(events())),
      onEventResizeEnd: (d) => setEvents(d.apply(events())),
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
            <span {...api().getHeaderTitleProps()}>Work Week · {api().visibleRangeText.formatted}</span>
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
                          <div {...api().getEventProps({ event: event() })}>
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
                      <Show when={api().getDragOrigin({ date: d() })}>{(origin) => <div {...origin().props} />}</Show>
                      <Show when={api().getDragGhost({ date: d() })}>
                        {(ghost) => (
                          <div {...ghost().props}>
                            <div class="scheduler-event-title">{ghost().event.title}</div>
                          </div>
                        )}
                      </Show>
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
