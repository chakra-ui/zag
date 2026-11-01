import { startOfWeek, toCalendarDateTime } from "@internationalized/date"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/scheduler.css"

const TODAY = schedulerAnchor
const WEEK = startOfWeek(TODAY, "en-US")

const BUSINESS_START = 9
const BUSINESS_END = 17

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Movable",
    start: WEEK.add({ days: 2 }).set({ hour: 10, minute: 0 }),
    end: WEEK.add({ days: 2 }).set({ hour: 11, minute: 0 }),
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Occupied",
    start: WEEK.add({ days: 2 }).set({ hour: 13, minute: 0 }),
    end: WEEK.add({ days: 2 }).set({ hour: 14, minute: 0 }),
    color: "#ef4444",
  },
]

export default function Page() {
  const [events, setEvents] = createSignal(INITIAL)
  const [log, setLog] = createSignal<string[]>([])

  const id = createUniqueId()
  const service = useMachine(scheduler.machine, (): scheduler.Props => ({
    id,
    defaultView: "day",
    defaultDate: WEEK.add({ days: 2 }),
    dayStartHour: 7,
    dayEndHour: 20,
    events: events(),
    // reject anything outside business hours or overlapping another event
    canDropEvent({ event, newStart, newEnd }) {
      // DateValue may be a date without a time, so narrow before reading the hour
      const start = toCalendarDateTime(newStart)
      const end = toCalendarDateTime(newEnd)
      if (start.hour < BUSINESS_START || end.hour > BUSINESS_END) return false
      return !events().some(
        (other) => other.id !== event.id && newStart.compare(other.end) < 0 && newEnd.compare(other.start) > 0,
      )
    },
    onEventDrop(details) {
      setLog((prev) => [...prev, `drop:${details.event.id}`])
      setEvents((prev) =>
        prev.map((e) => (e.id === details.event.id ? { ...e, start: details.newStart, end: details.newEnd } : e)),
      )
    },
  }))

  const api = createMemo(() => scheduler.connect(service, normalizeProps))

  return (
    <>
      <main class="scheduler">
        <p>
          Business hours {BUSINESS_START}:00–{BUSINESS_END}:00. Dragging outside them, or onto &ldquo;Occupied&rdquo;,
          marks the event <code>data-invalid</code> and the release is rejected.
        </p>

        <div {...api().getRootProps()}>
          <div {...api().getHeaderProps()}>
            <span {...api().getHeaderTitleProps()}>{api().visibleRangeText.formatted}</span>
          </div>

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

            <div class="scheduler-time-grid-scroll" tabIndex={0} role="group" aria-label="Time grid">
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
                        <Index each={api().getEventsForColumn(column())}>
                          {(event) => (
                            <div {...api().getEventProps({ event: event() })}>
                              <div class="scheduler-event-title">{event().title}</div>
                              <div {...api().getEventResizeHandleProps({ event: event(), edge: "end" })}>
                                <div class="scheduler-resize-grip" />
                              </div>
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

        <div data-testid="drop-log">{log().join(" ")}</div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
