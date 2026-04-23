import { CalendarDate, CalendarDateTime, type DateValue } from "@internationalized/date"
import * as datePicker from "@zag-js/date-picker"
import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

const TODAY = scheduler.getToday()

const INITIAL: scheduler.SchedulerEvent[] = [
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
]

const toCalDate = (d: DateValue) => new CalendarDate(d.year, d.month, d.day)
const toCalDateTime = (d: DateValue) => new CalendarDateTime(d.year, d.month, d.day, 0, 0)

export default function Page() {
  const controls = useControls(schedulerControls)
  const [date, setDate] = createSignal<DateValue>(TODAY)
  const [events, setEvents] = createSignal<scheduler.SchedulerEvent[]>(INITIAL)

  const dpService = useMachine(datePicker.machine, () => ({
    id: createUniqueId(),
    inline: true,
    selectionMode: "single",
    value: [toCalDate(date())],
    focusedValue: toCalDate(date()),
    onValueChange: (d) => {
      if (d.value[0]) setDate(toCalDateTime(d.value[0]))
    },
    onFocusChange: (d) => {
      if (d.focusedValue) setDate(toCalDateTime(d.focusedValue))
    },
  }))
  const dp = createMemo(() => datePicker.connect(dpService, normalizeProps))

  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>(() => ({
      id: createUniqueId(),
      view: "week",
      date: date(),
      events: events(),
      onDateChange: (d) => setDate(d.date),
      onEventDragEnd: (d) => setEvents(d.apply(events())),
      onEventResizeEnd: (d) => setEvents(d.apply(events())),
    })),
  )
  const api = createMemo(() => scheduler.connect(service, normalizeProps))

  return (
    <>
      <main class="scheduler" style={{ "align-self": "stretch", width: "100%" }}>
        <div
          style={{
            display: "grid",
            "grid-template-columns": "340px minmax(0, 1fr)",
            gap: "16px",
            "align-items": "start",
            width: "100%",
          }}
        >
          <div
            class="date-picker"
            style={{
              border: "1px solid #e5e7eb",
              "border-radius": "8px",
              padding: "12px",
              background: "#fff",
              "font-size": "13px",
            }}
          >
            <div {...dp().getRootProps()}>
              <div {...dp().getContentProps()}>
                <div
                  {...dp().getViewControlProps({ view: "day" })}
                  style={{ display: "flex", gap: "6px", "margin-bottom": "10px", "align-items": "center" }}
                >
                  <button {...dp().getPrevTriggerProps()}>{api().prevTriggerIcon}</button>
                  <button {...dp().getViewTriggerProps()} style={{ flex: 1, "font-weight": 600 }}>
                    {dp().visibleRangeText.start}
                  </button>
                  <button {...dp().getNextTriggerProps()}>{api().nextTriggerIcon}</button>
                </div>
                <table
                  {...dp().getTableProps({ view: "day" })}
                  style={{ width: "100%", "border-collapse": "collapse", "table-layout": "fixed" }}
                >
                  <thead {...dp().getTableHeaderProps({ view: "day" })}>
                    <tr {...dp().getTableRowProps({ view: "day" })}>
                      <Index each={dp().weekDays}>
                        {(d) => (
                          <th
                            scope="col"
                            aria-label={d().long}
                            style={{ "font-size": "11px", color: "#9ca3af", "font-weight": 500, padding: "4px" }}
                          >
                            {d().narrow}
                          </th>
                        )}
                      </Index>
                    </tr>
                  </thead>
                  <tbody {...dp().getTableBodyProps({ view: "day" })}>
                    <Index each={dp().weeks}>
                      {(week) => (
                        <tr {...dp().getTableRowProps({ view: "day" })}>
                          <Index each={week()}>
                            {(value) => (
                              <td
                                {...dp().getDayTableCellProps({ value: value() })}
                                style={{ padding: "1px", "text-align": "center" }}
                              >
                                <div {...dp().getDayTableCellTriggerProps({ value: value() })}>{value().day}</div>
                              </td>
                            )}
                          </Index>
                        </tr>
                      )}
                    </Index>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

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
                              <div
                                {...api().getEventResizeHandleProps({ event: event(), edge: "end" })}
                                class="scheduler-resize-handle"
                              >
                                <div class="scheduler-resize-grip" />
                              </div>
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
      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
