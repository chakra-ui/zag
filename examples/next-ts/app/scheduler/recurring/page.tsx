"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls, schedulerRecurringEvents } from "@zag-js/shared"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useControls } from "@/hooks/use-controls"
import "@styles/scheduler.css"

export default function Page() {
  const controls = useControls(schedulerControls)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    ...controls.context,
    defaultDate: schedulerAnchor,
    events: schedulerRecurringEvents,
  })

  const api = scheduler.connect(service, normalizeProps)

  return (
    <>
      <main className="scheduler">
        <div {...api.getRootProps()}>
          <div {...api.getHeaderProps()}>
            <button {...api.getPrevTriggerProps()}>
              <ChevronLeft />
            </button>
            <button {...api.getTodayTriggerProps()}>Today</button>
            <button {...api.getNextTriggerProps()}>
              <ChevronRight />
            </button>
            <span {...api.getHeaderTitleProps()}>
              {api.visibleRangeText.formatted} · {api.events.length} expanded events
            </span>
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

            <div className="scheduler-time-grid-scroll" tabIndex={0} role="group" aria-label="Time grid">
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
