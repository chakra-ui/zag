"use client"

import { startOfWeek } from "@internationalized/date"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as scheduler from "@zag-js/scheduler"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/scheduler.css"

const TODAY = scheduler.getToday()
const WEEK = startOfWeek(TODAY, "en-US")

const RESOURCES: scheduler.SchedulerResource[] = [
  { id: "studio-a", title: "Studio A", color: "#3b82f6" },
  { id: "studio-b", title: "Studio B", color: "#10b981" },
  { id: "studio-c", title: "Studio C", color: "#f59e0b" },
]

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Rehearsal",
    resourceId: "studio-a",
    start: WEEK.add({ days: 1 }).set({ hour: 9 }),
    end: WEEK.add({ days: 2 }).set({ hour: 17 }),
  },
  {
    id: "2",
    title: "Mixing",
    resourceId: "studio-b",
    start: WEEK.add({ days: 3 }).set({ hour: 10 }),
    end: WEEK.add({ days: 3 }).set({ hour: 18 }),
  },
  {
    id: "3",
    title: "Maintenance",
    resourceId: "studio-c",
    start: WEEK.add({ days: 4 }).set({ hour: 8 }),
    end: WEEK.add({ days: 6 }).set({ hour: 12 }),
  },
]

export default function Page() {
  const [events] = useState(INITIAL)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    defaultView: "timeline",
    defaultDate: WEEK.add({ days: 1 }),
    resources: RESOURCES,
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
