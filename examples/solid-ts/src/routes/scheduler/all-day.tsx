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
    id: "conf",
    title: "DevConf 2026",
    start: TODAY.subtract({ days: 3 }),
    end: TODAY.subtract({ days: 1 }),
    allDay: true,
    color: "#6366f1",
  },
  { id: "holiday", title: "Company holiday", start: TODAY, end: TODAY, allDay: true, color: "#ef4444" },
  {
    id: "standup",
    title: "Team standup",
    start: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 0 }),
    end: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 30 }),
    color: "#3b82f6",
  },
  {
    id: "demo",
    title: "Sprint demo",
    start: TODAY.subtract({ days: 2 }).set({ hour: 14, minute: 0 }),
    end: TODAY.subtract({ days: 2 }).set({ hour: 15, minute: 0 }),
    color: "#10b981",
  },
]

export default function Page() {
  const controls = useControls(schedulerControls)
  const [events, setEvents] = createSignal<scheduler.SchedulerEvent[]>(INITIAL)

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

  return (
    <>
      <main class="scheduler">
        <div {...api().getRootProps()}>
          <div {...api().getHeaderProps()}>
            <button {...api().getPrevTriggerProps()}>{api().prevTriggerIcon}</button>
            <button {...api().getTodayTriggerProps()}>{api().todayTriggerLabel}</button>
            <button {...api().getNextTriggerProps()}>{api().nextTriggerIcon}</button>
            <span {...api().getHeaderTitleProps()}>{api().visibleRangeText.formatted}</span>
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

            <div {...api().getAllDayRowProps()} class="scheduler-all-day-row">
              <div class="scheduler-all-day-label">All day</div>
              <Index each={api().visibleDays}>
                {(d) => (
                  <div class="scheduler-all-day-cell">
                    <Index
                      each={api()
                        .getEventsForDay(d())
                        .filter((e) => e.allDay)}
                    >
                      {(event) => (
                        <div
                          {...api().getEventProps({ event: event() })}
                          class="scheduler-all-day-event"
                          style={{ "--event-color": event().color ?? "#3b82f6" }}
                        >
                          {event().title}
                        </div>
                      )}
                    </Index>
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
                      <Index
                        each={api()
                          .getEventsForDay(d())
                          .filter((e) => !e.allDay)}
                      >
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
