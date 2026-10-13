import { startOfWeek } from "@internationalized/date"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerBacklog } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, Index, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/scheduler.css"

const TODAY = schedulerAnchor
const WEEK = startOfWeek(TODAY, "en-US")

export default function Page() {
  const [events, setEvents] = createSignal<scheduler.SchedulerEvent[]>([])
  const [backlog, setBacklog] = createSignal(schedulerBacklog)

  const id = createUniqueId()
  const service = useMachine(scheduler.machine, (): scheduler.Props => ({
    id,
    defaultView: "day",
    defaultDate: WEEK.add({ days: 2 }),
    dayStartHour: 8,
    dayEndHour: 18,
    events: events(),
    onEventReceive(details) {
      const item = backlog().find((b) => b.id === details.data)
      if (!item) return
      setBacklog((prev) => prev.filter((b) => b.id !== item.id))
      setEvents((prev) => [
        ...prev,
        {
          id: item.id,
          title: item.title,
          start: details.start,
          end: details.end,
          allDay: details.allDay,
          color: details.allDay ? "#8b5cf6" : "#3b82f6",
        },
      ])
    },
  }))

  const api = createMemo(() => scheduler.connect(service, normalizeProps))

  return (
    <>
      <main class="scheduler">
        <p>Drag an item from the backlog onto the grid.</p>

        <ul class="scheduler-backlog" data-testid="backlog">
          <For each={backlog()}>
            {(item) => (
              <li>
                <button
                  type="button"
                  draggable="true"
                  data-testid={`backlog-${item.id}`}
                  onDragStart={(event) => event.dataTransfer?.setData("text/plain", item.id)}
                >
                  {item.title}
                </button>
              </li>
            )}
          </For>
        </ul>

        <div {...api().getRootProps()}>
          <div class="scheduler-time-grid-wrapper">
            <div {...api().getColumnHeadersProps()}>
              <div class="scheduler-gutter-header" />
              <Index each={api().columns}>
                {(column) => (
                  <div {...api().getColumnHeaderProps(column())}>
                    <span class="scheduler-header-day-label">{api().formatWeekDay(column().date)}</span>
                  </div>
                )}
              </Index>
            </div>

            <div {...api().getAllDayRowProps()}>
              <div {...api().getAllDayLabelProps()}>All day</div>
              <Index each={api().visibleDays}>
                {(date, index) => (
                  <div
                    {...api().getDayCellProps({ date: date(), allDay: true })}
                    style={{ "z-index": api().visibleDays.length - index }}
                  >
                    <Index
                      each={api()
                        .getAllDaySegments()
                        .filter((segment) => segment.column === index)}
                    >
                      {(segment) => (
                        <div
                          {...api().getEventProps({ event: segment().event, layout: "all-day", segment: segment() })}
                        >
                          {segment().event.title}
                        </div>
                      )}
                    </Index>
                  </div>
                )}
              </Index>
            </div>

            <div class="scheduler-time-grid-scroll" tabIndex={0} aria-label="Schedule grid">
              <div {...api().getGridProps()}>
                <div {...api().getGridRowProps()}>
                  <div {...api().getTimeGutterProps()}>
                    <Index each={api().hourRange.hours}>
                      {(hour) => <div {...api().getHourLabelProps({ hour: hour() })}>{hour().label}</div>}
                    </Index>
                  </div>

                  <Index each={api().columns}>
                    {(column) => (
                      <div {...api().getDayColumnProps(column())}>
                        <Index each={api().hourRange.hours}>
                          {(hour) => <div {...api().getHourLineProps({ hour: hour() })} />}
                        </Index>
                        <Index
                          each={api()
                            .getEventsForColumn(column())
                            .filter((e) => !e.allDay)}
                        >
                          {(event) => (
                            <div {...api().getEventProps({ event: event() })}>
                              <div class="scheduler-event-title">{event().title}</div>
                            </div>
                          )}
                        </Index>
                        <div {...api().getDragOriginProps(column())} />
                        <div {...api().getDragPreviewProps(column())}>
                          <div class="scheduler-event-title">{api().dragState?.event.title}</div>
                        </div>
                      </div>
                    )}
                  </Index>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
