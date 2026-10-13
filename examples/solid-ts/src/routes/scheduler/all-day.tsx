import * as scheduler from "@zag-js/scheduler"
import { schedulerAllDayEvents, schedulerAnchor, schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronLeft, ChevronRight } from "lucide-solid"
import { For, Index, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/scheduler.css"

export default function Page() {
  const controls = useControls(schedulerControls)
  const [events, setEvents] = createSignal(schedulerAllDayEvents)
  const [dropLog, setDropLog] = createSignal("")
  const [maxAllDayRows, setMaxAllDayRows] = createSignal<number | undefined>(undefined)

  const id = createUniqueId()
  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>(() => ({
      id,
      defaultDate: schedulerAnchor,
      maxAllDayRows: maxAllDayRows(),
      events: events(),
      onEventDrop(d) {
        // the machine reports the region it landed in; converting the event is the consumer's call
        setDropLog(`${d.event.id} allDay:${d.allDay} ${d.newStart} → ${d.newEnd} Δ${d.delta.days}d${d.delta.minutes}m`)
        setEvents((prev) =>
          prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd, allDay: d.allDay } : e)),
        )
      },
      onEventResize: (d) =>
        setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
    })),
  )

  const api = createMemo(() => scheduler.connect(service, normalizeProps))

  return (
    <>
      <main class="scheduler">
        <output data-testid="drop-log">{dropLog()}</output>
        <label>
          <input
            type="checkbox"
            data-testid="cap-rows"
            checked={maxAllDayRows() === 1}
            onChange={(e) => setMaxAllDayRows(e.currentTarget.checked ? 1 : undefined)}
          />
          Cap the all-day row at one level
        </label>
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

            <div {...api().getAllDayRowProps()}>
              <div {...api().getAllDayLabelProps()}>All day</div>
              <Index each={api().visibleDays}>
                {(date, index) => (
                  <div
                    {...api().getDayCellProps({ date: date(), allDay: true })}
                    // a bar overflows to the right, so earlier cells must paint above later ones
                    style={{ "z-index": api().visibleDays.length - index }}
                  >
                    <For
                      each={api()
                        .getAllDayOverflow()
                        .filter((entry) => entry.date.compare(date()) === 0)}
                    >
                      {(entry) => (
                        <button
                          {...api().getMoreEventsProps({ date: date(), count: entry.count })}
                          class="scheduler-all-day-more"
                        >
                          +{entry.count} more
                        </button>
                      )}
                    </For>
                    {/* a bar lives in the cell it starts on and overflows across the ones it covers */}
                    <Index
                      each={api()
                        .getAllDaySegments()
                        .filter((segment) => segment.column === index)}
                    >
                      {(segment) => (
                        <div
                          {...api().getEventProps({ event: segment().event, layout: "all-day", segment: segment() })}
                        >
                          <Show when={segment().isStart}>
                            <div {...api().getEventResizeHandleProps({ event: segment().event, edge: "start" })} />
                          </Show>
                          <span class="scheduler-event-title">{segment().event.title}</span>
                          <Show when={segment().isEnd}>
                            <div {...api().getEventResizeHandleProps({ event: segment().event, edge: "end" })} />
                          </Show>
                        </div>
                      )}
                    </Index>
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
                        <Index
                          each={api()
                            .getEventsForDay(date())
                            .filter((e) => !e.allDay)}
                        >
                          {(event) => (
                            <div {...api().getEventProps({ event: event() })}>
                              <div class="scheduler-event-title">{event().title}</div>
                              <div {...api().getEventResizeHandleProps({ event: event(), edge: "end" })}>
                                <div class="scheduler-resize-grip" />
                              </div>
                            </div>
                          )}
                        </Index>
                        <div {...api().getDragOriginProps({ date: date() })} />
                        <div {...api().getDragPreviewProps({ date: date() })}>
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
      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
