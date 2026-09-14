"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerResourceEvents, schedulerResources } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/scheduler.css"

export default function Page() {
  const [events] = useState(schedulerResourceEvents)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    defaultView: "timeline",
    resources: schedulerResources,
    defaultDate: schedulerAnchor,
    events,
  })

  const api = scheduler.connect(service, normalizeProps)
  const timeline = api.getTimelineState()

  return (
    <>
      <main className="scheduler">
        <div {...api.getRootProps()}>
          <div {...api.getHeaderProps()}>
            <button {...api.getPrevTriggerProps()}>‹</button>
            <button {...api.getTodayTriggerProps()}>Today</button>
            <button {...api.getNextTriggerProps()}>›</button>
            <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
          </div>

          <div {...api.getTimelineProps()}>
            <div {...api.getTimelineHeaderProps()}>
              <div className="scheduler-timeline-corner" />
              <div className="scheduler-timeline-axis">
                {timeline.slots.map((slot) => (
                  <div key={slot.start.toString()} {...api.getTimelineSlotProps({ slot })}>
                    {slot.label}
                  </div>
                ))}
              </div>
            </div>

            {timeline.rows.map((row) => (
              <div key={row.id} {...api.getTimelineRowProps({ row })}>
                <div {...api.getTimelineRowHeaderProps({ row })}>{row.title}</div>
                <div {...api.getTimelineTrackProps({ row })}>
                  {api.getEventsForRow(row).map((event) => (
                    <div key={event.id} {...api.getEventProps({ event, layout: "timeline" })}>
                      <span className="scheduler-event-title">{event.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
