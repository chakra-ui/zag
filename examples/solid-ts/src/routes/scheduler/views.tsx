import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls, schedulerEvents } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronLeft, ChevronRight } from "lucide-solid"
import { Index, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/scheduler.css"

export default function Page() {
  const controls = useControls(schedulerControls)
  const [events, setEvents] = createSignal(schedulerEvents)

  const id = createUniqueId()
  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>(() => ({
      id,
      defaultDate: schedulerAnchor,
      events: events(),
      onEventDrop: (d) =>
        setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
      onEventResize: (d) =>
        setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
      onEventClick(d) {
        console.log("event clicked", d.event.title)
      },
      onSlotSelect(d) {
        console.log("slot selected", d)
      },
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
            <div {...api().getViewSelectProps()}>
              <Index each={["day", "week", "month"] as scheduler.ViewType[]}>
                {(v) => <button {...api().getViewItemProps({ view: v() })}>{api().getViewText(v())}</button>}
              </Index>
            </div>
          </div>

          <Show
            when={api().view === "month"}
            fallback={
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
                        style={{ "z-index": api().visibleDays.length - index }}
                      >
                        <Index
                          each={api()
                            .getAllDaySegments()
                            .filter((segment) => segment.column === index)}
                        >
                          {(segment) => (
                            <div
                              {...api().getEventProps({
                                event: segment().event,
                                layout: "all-day",
                                segment: segment(),
                              })}
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
                        {(date) => {
                          const dayEvents = createMemo(() =>
                            api()
                              .getEventsForDay(date())
                              .filter((e) => !e.allDay),
                          )

                          return (
                            <div {...api().getDayColumnProps({ date: date() })}>
                              <Index each={api().hourRange.hours}>
                                {(hour) => <div {...api().getHourLineProps({ hour: hour() })} />}
                              </Index>

                              <div {...api().getCurrentTimeIndicatorProps({ date: date() })} />

                              <Index each={dayEvents()}>
                                {(event) => (
                                  <div {...api().getEventProps({ event: event() })}>
                                    <div class="scheduler-event-title">{event().title}</div>
                                    <div class="scheduler-event-time">{event().start.toString().slice(11, 16)}</div>
                                    <div {...api().getEventResizeHandleProps({ event: event(), edge: "end" })}>
                                      <div class="scheduler-resize-grip" />
                                    </div>
                                  </div>
                                )}
                              </Index>

                              <div {...api().getDragPreviewProps({ date: date() })}>
                                <div class="scheduler-event-title">{api().dragState?.event.title}</div>
                              </div>
                            </div>
                          )
                        }}
                      </Index>
                    </div>
                  </div>
                </div>
              </div>
            }
          >
            <div class="scheduler-month-grid">
              <div class="scheduler-month-header">
                <Index each={api().getWeekDays()}>
                  {(day) => <div class="scheduler-month-weekday">{day().short}</div>}
                </Index>
              </div>
              <div class="scheduler-month-body">
                <Index each={api().getMonthGrid(api().date)}>
                  {(week) => {
                    // segments are asked for one row at a time, so a bar clips at the week edge
                    const bars = createMemo(() => api().getAllDaySegments(week()))
                    return (
                      <div class="scheduler-month-week">
                        <Index each={week()}>
                          {(date, dayIndex) => {
                            const timed = createMemo(() =>
                              api()
                                .getEventsForDay(date())
                                .filter((e) => !e.allDay),
                            )
                            return (
                              <div
                                {...api().getDayCellProps({ date: date(), referenceDate: api().date })}
                                class="scheduler-month-cell"
                                style={{ "z-index": week().length - dayIndex }}
                              >
                                <div class="scheduler-month-day-number">{date().day}</div>
                                <Index each={bars().filter((segment) => segment.column === dayIndex)}>
                                  {(segment) => (
                                    <div
                                      {...api().getEventProps({
                                        event: segment().event,
                                        layout: "all-day",
                                        segment: segment(),
                                      })}
                                      class="scheduler-month-bar"
                                    >
                                      {segment().event.title}
                                    </div>
                                  )}
                                </Index>
                                <Index each={timed().slice(0, 2)}>
                                  {(event) => (
                                    <div
                                      {...api().getEventProps({ event: event(), layout: "list" })}
                                      class="scheduler-month-event"
                                    >
                                      {event().title}
                                    </div>
                                  )}
                                </Index>
                                <Show when={timed().length > 2}>
                                  <button {...api().getMoreEventsProps({ date: date(), count: timed().length - 2 })}>
                                    +{timed().length - 2} more
                                  </button>
                                </Show>
                              </div>
                            )
                          }}
                        </Index>
                      </div>
                    )
                  }}
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
