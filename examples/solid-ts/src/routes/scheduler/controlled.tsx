import type { DateValue } from "@internationalized/date"
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
    title: "Sprint planning",
    start: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 0 }),
    end: TODAY.subtract({ days: 4 }).set({ hour: 10, minute: 0 }),
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Interview",
    start: TODAY.subtract({ days: 3 }).set({ hour: 11, minute: 0 }),
    end: TODAY.subtract({ days: 3 }).set({ hour: 12, minute: 0 }),
    color: "#ef4444",
  },
  {
    id: "3",
    title: "1:1 with manager",
    start: TODAY.subtract({ days: 1 }).set({ hour: 14, minute: 0 }),
    end: TODAY.subtract({ days: 1 }).set({ hour: 14, minute: 30 }),
    color: "#10b981",
  },
]

export default function Page() {
  const controls = useControls(schedulerControls)
  const [view, setView] = createSignal<scheduler.ViewType>("week")
  const [date, setDate] = createSignal<DateValue>(TODAY)
  const [events, setEvents] = createSignal<scheduler.SchedulerEvent[]>(INITIAL)
  const [selectedTitle, setSelectedTitle] = createSignal<string | null>(null)

  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>(() => ({
      id: createUniqueId(),
      view: view(),
      date: date(),
      events: events(),
      onViewChange: (d) => setView(d.view),
      onDateChange: (d) => setDate(d.date),
      onEventClick: (d) => setSelectedTitle(d.event.title ?? null),
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
            <div {...api().getViewSelectProps()}>
              <Index each={["day", "week"] as scheduler.ViewType[]}>
                {(v) => <button {...api().getViewItemProps({ view: v() })}>{v()}</button>}
              </Index>
            </div>
          </div>

          <div style={{ "font-size": "13px", color: "#6b7280", "margin-bottom": "4px" }}>
            View: <strong>{view()}</strong> · {events().length} events
            <Show when={selectedTitle()}>
              {" "}
              · Selected: <strong>{selectedTitle()}</strong>
            </Show>
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
