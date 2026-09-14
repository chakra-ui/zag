"use client"

import type { CalendarDateTime } from "@internationalized/date"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls, schedulerEvents } from "@zag-js/shared"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useControls } from "@/hooks/use-controls"
import "@styles/scheduler.css"

export default function Page() {
  const controls = useControls(schedulerControls)
  const [selectedDate, setSelectedDate] = useState<CalendarDateTime>(schedulerAnchor)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    ...controls.context,
    view: "month",
    defaultDate: schedulerAnchor,
    events: schedulerEvents,
  })

  const api = scheduler.connect(service, normalizeProps)
  const weeks = api.getMonthGrid(api.date)
  const selectedDayEvents = api.getEventsForDay(selectedDate)

  return (
    <>
      <main className="scheduler">
        <div {...mergeProps(api.getRootProps(), { style: { maxWidth: 420 } })}>
          <div {...api.getHeaderProps()}>
            <button {...api.getPrevTriggerProps()}>
              <ChevronLeft />
            </button>
            <span {...api.getHeaderTitleProps()}>
              {api.getMonthName(api.date)} {api.date.year}
            </span>
            <button {...api.getNextTriggerProps()}>
              <ChevronRight />
            </button>
          </div>

          <div className="scheduler-mobile-month">
            <div className="scheduler-mobile-weekdays">
              {api.getWeekDays().map((day, i) => (
                <div key={i}>{day.short}</div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="scheduler-mobile-week">
                {week.map((date) => {
                  const isSelected = date.compare(selectedDate) === 0
                  const dayEvents = api.getEventsForDay(date)
                  return (
                    <button
                      key={date.toString()}
                      type="button"
                      {...api.getDayCellProps({ date, referenceDate: api.date })}
                      className="scheduler-mobile-day"
                      data-selected={isSelected || undefined}
                      onClick={() => setSelectedDate(date)}
                      aria-label={api.formatLongDate(date)}
                    >
                      <span className="scheduler-mobile-day-num">{date.day}</span>
                      <span className="scheduler-mobile-dots">
                        {dayEvents.slice(0, 3).map((e) => (
                          <span
                            key={e.id}
                            className="scheduler-mobile-dot"
                            style={{ background: e.color ?? "#3b82f6" }}
                          />
                        ))}
                      </span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          <div className="scheduler-mobile-agenda">
            <div {...api.getAgendaGroupTitleProps({ date: selectedDate })}>{api.formatLongDate(selectedDate)}</div>
            {selectedDayEvents.length === 0 ? (
              <div className="scheduler-mobile-agenda-empty">No events</div>
            ) : (
              selectedDayEvents.map((event) => (
                <div key={event.id} {...api.getEventProps({ event, layout: "list" })}>
                  <div className="scheduler-mobile-agenda-time">{api.formatTimeRange(event.start, event.end)}</div>
                  <div className="scheduler-event-title">{event.title}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
