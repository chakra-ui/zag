import { CalendarDate, CalendarDateTime, type DateValue } from "@internationalized/date"
import * as datePicker from "@zag-js/date-picker"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls, schedulerEvents } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronLeft, ChevronRight } from "lucide-solid"
import { Index, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/scheduler.css"
import "@styles/date-picker.css"

const toCalDate = (d: CalendarDateTime) => new CalendarDate(d.year, d.month, d.day)
const toCalDateTime = (d: DateValue) => new CalendarDateTime(d.year, d.month, d.day, 0, 0)

export default function Page() {
  const controls = useControls(schedulerControls)
  const [date, setDate] = createSignal<CalendarDateTime>(schedulerAnchor)
  const [events, setEvents] = createSignal(schedulerEvents)

  const dpId = createUniqueId()
  const dpService = useMachine(datePicker.machine, (): datePicker.Props => ({
    id: dpId,
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

  const id = createUniqueId()
  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>(() => ({
      id,
      view: "week",
      date: date(),
      defaultDate: schedulerAnchor,
      events: events(),
      onDateChange: (d) => setDate(d.date),
      onEventDrop: (d) =>
        setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
      onEventResize: (d) =>
        setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
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
                  <button {...dp().getPrevTriggerProps()}>
                    <ChevronLeft />
                  </button>
                  <button {...dp().getViewTriggerProps()} style={{ flex: 1, "font-weight": 600 }}>
                    {dp().visibleRangeText.start}
                  </button>
                  <button {...dp().getNextTriggerProps()}>
                    <ChevronRight />
                  </button>
                </div>
                <table
                  {...dp().getTableProps({ view: "day" })}
                  style={{ width: "100%", "border-collapse": "collapse", "table-layout": "fixed" }}
                >
                  <thead {...dp().getTableHeaderProps({ view: "day" })}>
                    <tr {...dp().getTableRowProps({ view: "day" })}>
                      <Index each={dp().weekDays}>
                        {(day) => (
                          <th
                            scope="col"
                            aria-label={day().long}
                            style={{ "font-size": "11px", color: "#9ca3af", "font-weight": 500, padding: "4px" }}
                          >
                            {day().narrow}
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
                          <Index each={api().getEventsForDay(date())}>
                            {(event) => (
                              <div {...api().getEventProps({ event: event() })}>
                                <div class="scheduler-event-title">{event().title}</div>
                                <div {...api().getEventResizeHandleProps({ event: event(), edge: "end" })}>
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
        </div>
      </main>
      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
