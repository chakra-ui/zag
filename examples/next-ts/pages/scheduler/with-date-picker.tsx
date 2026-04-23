import * as datePicker from "@zag-js/date-picker"
import * as scheduler from "@zag-js/scheduler"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { normalizeProps, useMachine } from "@zag-js/react"
import { schedulerControls } from "@zag-js/shared"
import { CalendarDate, CalendarDateTime, type DateValue } from "@internationalized/date"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

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
  const [date, setDate] = useState<DateValue>(TODAY)
  const [events, setEvents] = useState(INITIAL)

  const dpService = useMachine(datePicker.machine, {
    id: useId(),
    inline: true,
    selectionMode: "single",
    value: [toCalDate(date)],
    focusedValue: toCalDate(date),
    onValueChange: (d) => {
      if (d.value[0]) setDate(toCalDateTime(d.value[0]))
    },
    onFocusChange: (d) => {
      if (d.focusedValue) setDate(toCalDateTime(d.focusedValue))
    },
  })

  const dp = datePicker.connect(dpService, normalizeProps)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    view: "week",
    ...controls.context,
    date,
    events,
    onDateChange: (d) => setDate(d.date),
    onEventDrop: (d) => setEvents(d.apply),
    onEventResize: (d) => setEvents(d.apply),
  })

  const api = scheduler.connect(service, normalizeProps)
  const { visibleDays, hourRange, weekDays } = api

  return (
    <>
      <main className="scheduler" style={{ alignSelf: "stretch", width: "100%" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "340px minmax(0, 1fr)",
            gap: 16,
            alignItems: "start",
            width: "100%",
          }}
        >
          <div
            className="date-picker"
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: 12,
              background: "#fff",
              fontSize: 13,
            }}
          >
            <div {...dp.getRootProps()}>
              <div {...dp.getContentProps()}>
                <div
                  {...dp.getViewControlProps({ view: "day" })}
                  style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center" }}
                >
                  <button {...dp.getPrevTriggerProps()}>
                    <ChevronLeft />
                  </button>
                  <button {...dp.getViewTriggerProps()} style={{ flex: 1, fontWeight: 600 }}>
                    {dp.visibleRangeText.start}
                  </button>
                  <button {...dp.getNextTriggerProps()}>
                    <ChevronRight />
                  </button>
                </div>
                <table
                  {...dp.getTableProps({ view: "day" })}
                  style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}
                >
                  <thead {...dp.getTableHeaderProps({ view: "day" })}>
                    <tr {...dp.getTableRowProps({ view: "day" })}>
                      {dp.weekDays.map((day, i) => (
                        <th
                          key={i}
                          scope="col"
                          aria-label={day.long}
                          style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500, padding: 4 }}
                        >
                          {day.narrow}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody {...dp.getTableBodyProps({ view: "day" })}>
                    {dp.weeks.map((week, i) => (
                      <tr key={i} {...dp.getTableRowProps({ view: "day" })}>
                        {week.map((value, j) => (
                          <td
                            key={j}
                            {...dp.getDayTableCellProps({ value })}
                            style={{ padding: 1, textAlign: "center" }}
                          >
                            <div {...dp.getDayTableCellTriggerProps({ value })}>{value.day}</div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div {...api.getRootProps()}>
            <div {...api.getHeaderProps()}>
              <button {...api.getPrevTriggerProps()}>
                <ChevronLeft />
              </button>
              <button {...api.getTodayTriggerProps()}>{api.todayTriggerLabel}</button>
              <button {...api.getNextTriggerProps()}>
                <ChevronRight />
              </button>
              <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
            </div>

            <div className="scheduler-time-grid-wrapper">
              <div className="scheduler-col-headers">
                <div className="scheduler-header-cell scheduler-gutter-header" />
                {visibleDays.map((date, i) => (
                  <div key={date.toString()} className="scheduler-header-cell">
                    <span className="scheduler-header-day-label">{weekDays[i % 7].short}</span>
                    <span className="scheduler-header-day-num">{date.day}</span>
                  </div>
                ))}
              </div>

              <div className="scheduler-time-grid-scroll">
                <div {...api.getGridProps()} className="scheduler-time-grid">
                  <div {...api.getTimeGutterProps()}>
                    {hourRange.hours.map((hour) => (
                      <div key={hour.value} className="scheduler-hour-label" style={hour.style}>
                        {hour.label}
                      </div>
                    ))}
                  </div>
                  {visibleDays.map((date) => (
                    <div key={date.toString()} {...api.getDayColumnProps({ date })}>
                      {hourRange.hours.map((hour) => (
                        <div key={hour.value} className="scheduler-hour-line" style={hour.style} />
                      ))}
                      {api.getEventsForDay(date).map((event) => (
                        <div key={event.id} {...api.getEventProps({ event })}>
                          <div className="scheduler-event-title">{event.title}</div>
                          <div
                            {...api.getEventResizeHandleProps({ event, edge: "end" })}
                            className="scheduler-resize-handle"
                          >
                            <div className="scheduler-resize-grip" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
