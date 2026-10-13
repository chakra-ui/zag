import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerResourceEvents, schedulerResources } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/scheduler.css"

export default function Page() {
  const service = useMachine(scheduler.machine, {
    id: createUniqueId(),
    defaultView: "timeline",
    resources: schedulerResources,
    defaultDate: schedulerAnchor,
    events: schedulerResourceEvents,
  })

  const api = createMemo(() => scheduler.connect(service, normalizeProps))
  const timeline = createMemo(() => api().getTimelineState())

  return (
    <>
      <main class="scheduler">
        <div {...api().getRootProps()}>
          <div {...api().getHeaderProps()}>
            <button {...api().getPrevTriggerProps()}>‹</button>
            <button {...api().getTodayTriggerProps()}>Today</button>
            <button {...api().getNextTriggerProps()}>›</button>
            <span {...api().getHeaderTitleProps()}>{api().visibleRangeText.formatted}</span>
          </div>

          <div {...api().getTimelineProps()}>
            <div {...api().getTimelineHeaderProps()}>
              <div class="scheduler-timeline-corner" />
              <div class="scheduler-timeline-axis">
                <Index each={timeline().slots}>
                  {(slot) => <div {...api().getTimelineSlotProps({ slot: slot() })}>{slot().label}</div>}
                </Index>
              </div>
            </div>

            <Index each={timeline().rows}>
              {(row) => (
                <div {...api().getTimelineRowProps({ row: row() })}>
                  <div {...api().getTimelineRowHeaderProps({ row: row() })}>{row().title}</div>
                  <div {...api().getTimelineTrackProps({ row: row() })}>
                    <Index each={api().getEventsForRow(row())}>
                      {(event) => (
                        <div {...api().getEventProps({ event: event(), layout: "timeline" })}>
                          <span class="scheduler-event-title">{event().title}</span>
                        </div>
                      )}
                    </Index>
                  </div>
                </div>
              )}
            </Index>
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
