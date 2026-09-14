"use client"

import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls, schedulerEvents } from "@zag-js/shared"
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
    view: "agenda",
    defaultDate: schedulerAnchor,
    events: schedulerEvents,
  })

  const api = scheduler.connect(service, normalizeProps)
  const groups = api.getAgendaGroups()

  return (
    <>
      <main className="scheduler">
        <div {...mergeProps(api.getRootProps(), { style: { maxWidth: 520 } })}>
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

          <div className="scheduler-mobile-agenda">
            {groups.length === 0 ? (
              <div className="scheduler-mobile-agenda-empty">
                No events between {api.formatLongDate(api.visibleRange.start)} and{" "}
                {api.formatLongDate(api.visibleRange.end)}
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.date.toString()} {...api.getAgendaGroupProps({ date: group.date })}>
                  <div {...api.getAgendaGroupTitleProps({ date: group.date })}>{api.formatLongDate(group.date)}</div>
                  {group.events.map((event) => (
                    <div key={event.id} {...api.getEventProps({ event, layout: "list" })}>
                      <div className="scheduler-mobile-agenda-time">{api.formatTimeRange(event.start, event.end)}</div>
                      <div className="scheduler-event-title">{event.title}</div>
                    </div>
                  ))}
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
