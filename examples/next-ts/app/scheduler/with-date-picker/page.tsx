"use client"

import { CalendarDate, CalendarDateTime, type DateValue } from "@internationalized/date"
import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls, schedulerEvents } from "@zag-js/shared"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useControls } from "@/hooks/use-controls"
import "@styles/scheduler.css"
import "@styles/date-picker.css"

const toCalDate = (d: CalendarDateTime) => new CalendarDate(d.year, d.month, d.day)
const toCalDateTime = (d: DateValue) => new CalendarDateTime(d.year, d.month, d.day, 0, 0)

export default function Page() {
  const controls = useControls(schedulerControls)
  const [date, setDate] = useState<CalendarDateTime>(schedulerAnchor)
  const [events, setEvents] = useState(schedulerEvents)

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
    defaultDate: schedulerAnchor,
    events,
    onDateChange: (d) => setDate(d.date),
    onEventDrop: (d) =>
      setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
    onEventResize: (d) =>
      setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
  })

  const api = scheduler.connect(service, normalizeProps)

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
              <button {...api.getTodayTriggerProps()}>Today</button>
              <button {...api.getNextTriggerProps()}>
                <ChevronRight />
              </button>
              <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
            </div>

            <div className="scheduler-time-grid-wrapper">
              <div {...api.getColumnHeadersProps()}>
                <div className="scheduler-gutter-header" />
                {api.visibleDays.map((date) => (
                  <div key={date.toString()} {...api.getColumnHeaderProps({ date })}>
                    <span className="scheduler-header-day-label">{api.formatWeekDay(date)}</span>
                    <span className="scheduler-header-day-num">{date.day}</span>
                  </div>
                ))}
              </div>

              <div className="scheduler-time-grid-scroll">
                <div {...api.getGridProps()}>
                  <div {...api.getGridRowProps()}>
                    <div {...api.getTimeGutterProps()}>
                      {api.hourRange.hours.map((hour) => (
                        <div key={hour.value} {...api.getHourLabelProps({ hour })}>
                          {hour.label}
                        </div>
                      ))}
                    </div>
                    {api.visibleDays.map((date) => (
                      <div key={date.toString()} {...api.getDayColumnProps({ date })}>
                        {api.hourRange.hours.map((hour) => (
                          <div key={hour.value} {...api.getHourLineProps({ hour })} />
                        ))}
                        <div {...api.getCurrentTimeIndicatorProps({ date })} />
                        {api.getEventsForDay(date).map((event) => (
                          <div key={event.id} {...api.getEventProps({ event })}>
                            <div className="scheduler-event-title">{event.title}</div>
                            <div {...api.getEventResizeHandleProps({ event, edge: "end" })}>
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
        </div>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
