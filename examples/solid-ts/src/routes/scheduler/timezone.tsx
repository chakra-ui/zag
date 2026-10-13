import { startOfWeek, toCalendarDate } from "@internationalized/date"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, Index, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/scheduler.css"

const ZONES = ["UTC", "America/New_York", "Europe/Berlin", "Asia/Tokyo"]

const TODAY = schedulerAnchor
const WEEK = startOfWeek(TODAY, "en-US")

const EVENTS: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Global standup",
    start: WEEK.add({ days: 2 }).set({ hour: 9 }),
    end: WEEK.add({ days: 2 }).set({ hour: 10 }),
    color: "#3b82f6",
  },
]

export default function Page() {
  const [timeZone, setTimeZone] = createSignal("UTC")

  const id = createUniqueId()
  const service = useMachine(scheduler.machine, (): scheduler.Props => ({
    id,
    defaultView: "day",
    defaultDate: WEEK.add({ days: 2 }),
    timeZone: timeZone(),
    events: EVENTS,
  }))

  const api = createMemo(() => scheduler.connect(service, normalizeProps))

  return (
    <>
      <main class="scheduler">
        <p>
          Event times are zoneless wall-clock values, so they read the same in every zone. What
          <code>timeZone</code> decides is which day counts as today.
        </p>

        <p>
          Today in this zone: <span data-testid="today">{toCalendarDate(api().today).toString()}</span>
        </p>

        <label>
          Time zone{" "}
          <select data-testid="zone" onChange={(e) => setTimeZone(e.currentTarget.value)}>
            <For each={ZONES}>
              {(zone) => (
                <option value={zone} selected={zone === timeZone()}>
                  {zone}
                </option>
              )}
            </For>
          </select>
        </label>

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
                        <Index each={api().getEventsForColumn(column())}>
                          {(event) => (
                            <div {...api().getEventProps({ event: event() })}>
                              <div class="scheduler-event-title">{event().title}</div>
                              <span data-testid={`time-${event().id}`}>
                                {api().formatTimeRange(event().start, event().end)}
                              </span>
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

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
