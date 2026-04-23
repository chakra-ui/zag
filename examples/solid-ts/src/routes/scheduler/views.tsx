import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

const TODAY = scheduler.getToday()

const INITIAL_EVENTS: scheduler.SchedulerEvent[] = [
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
    title: "Overlap A",
    start: TODAY.set({ hour: 9, minute: 15 }),
    end: TODAY.set({ hour: 10, minute: 15 }),
    color: "#ef4444",
  },
  {
    id: "5",
    title: "Overlap B",
    start: TODAY.set({ hour: 9, minute: 30 }),
    end: TODAY.set({ hour: 10, minute: 0 }),
    color: "#8b5cf6",
  },
]

export default function Page() {
  const controls = useControls(schedulerControls)
  const [events, setEvents] = createSignal<scheduler.SchedulerEvent[]>(INITIAL_EVENTS)

  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>(() => ({
      id: createUniqueId(),
      events: events(),
      onEventDragEnd: (d) => setEvents(d.apply(events())),
      onEventResizeEnd: (d) => setEvents(d.apply(events())),
      onEventClick: (d) => console.log("event clicked", d.event.title),
      onSlotSelect: (d) => console.log("slot selected", d),
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
              <Index each={["day", "week", "month"] as scheduler.ViewType[]}>
                {(v) => <button {...api().getViewItemProps({ view: v() })}>{v()}</button>}
              </Index>
            </div>
          </div>

          <Show
            when={api().view === "month"}
            fallback={
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
                          <div {...api().getCurrentTimeIndicatorProps()} />
                          <Index each={api().getEventsForDay(d())}>
                            {(event) => (
                              <div
                                {...api().getEventProps({ event: event() })}
                                style={{
                                  ...api().getEventStyle(event()),
                                  opacity: api().dragPreview?.eventId === event().id ? 0.25 : 1,
                                  "--event-color": event().color ?? "#3b82f6",
                                }}
                              >
                                <div class="scheduler-event-title">{String(event().title ?? "")}</div>
                                <div class="scheduler-event-time">{event().start.toString().slice(11, 16)}</div>
                                <div
                                  {...api().getEventResizeHandleProps({ event: event(), edge: "end" })}
                                  class="scheduler-resize-handle"
                                >
                                  <div class="scheduler-resize-grip" />
                                </div>
                              </div>
                            )}
                          </Index>
                          <Show when={api().getDragGhost({ date: d() })}>
                            {(ghost) => (
                              <div {...ghost().props}>
                                <div class="scheduler-event-title">{String(ghost().event.title ?? "")}</div>
                              </div>
                            )}
                          </Show>
                        </div>
                      )}
                    </Index>
                  </div>
                </div>
              </div>
            }
          >
            <div class="scheduler-month-grid">
              <div class="scheduler-month-header">
                <Index each={api().weekDays}>{(d) => <div class="scheduler-header-cell">{d().short}</div>}</Index>
              </div>
              <div class="scheduler-month-body">
                <Index each={api().getMonthGrid(api().date)}>
                  {(week) => (
                    <div class="scheduler-month-week">
                      <Index each={week()}>
                        {(cell) => (
                          <div
                            {...api().getDayCellProps({ date: cell().date, referenceDate: api().date })}
                            class="scheduler-month-cell"
                          >
                            <div class="scheduler-month-day-number">{cell().date.day}</div>
                            <Index each={api().getEventsForDay(cell().date).slice(0, 3)}>
                              {(event) => (
                                <div
                                  {...api().getEventProps({ event: event() })}
                                  class="scheduler-month-event"
                                  style={{ "--event-color": event().color ?? "#3b82f6" }}
                                >
                                  {String(event().title ?? "")}
                                </div>
                              )}
                            </Index>
                            <Show when={api().getEventsForDay(cell().date).length > 3}>
                              <button
                                {...api().getMoreEventsProps({
                                  date: cell().date,
                                  count: api().getEventsForDay(cell().date).length - 3,
                                })}
                                class="scheduler-more-events"
                              >
                                +{api().getEventsForDay(cell().date).length - 3} more
                              </button>
                            </Show>
                          </div>
                        )}
                      </Index>
                    </div>
                  )}
                </Index>
              </div>
            </div>
          </Show>
        </div>
      </main>
      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
