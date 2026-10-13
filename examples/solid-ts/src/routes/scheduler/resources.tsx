import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerResourceEvents, schedulerResources } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/scheduler.css"

export default function Page() {
  const [events, setEvents] = createSignal(schedulerResourceEvents)
  const [log, setLog] = createSignal<string[]>([])

  const id = createUniqueId()
  const service = useMachine(scheduler.machine, (): scheduler.Props => ({
    id,
    defaultView: "day",
    dayStartHour: 8,
    dayEndHour: 18,
    resources: schedulerResources,
    groupBy: "resource",
    defaultDate: schedulerAnchor,
    events: events(),
    onEventDrop(details) {
      setLog((prev) => [...prev, `drop:${details.event.id}:${details.resource?.id ?? "none"}`])
      setEvents((prev) =>
        prev.map((e) =>
          e.id === details.event.id
            ? { ...e, start: details.newStart, end: details.newEnd, resourceId: details.resource?.id ?? e.resourceId }
            : e,
        ),
      )
    },
    onSlotSelect(details) {
      setLog((prev) => [...prev, `slot:${details.resource?.id ?? "none"}`])
    },
  }))

  const api = createMemo(() => scheduler.connect(service, normalizeProps))

  return (
    <>
      <main class="scheduler">
        <div {...api().getRootProps()}>
          <div {...api().getHeaderProps()}>
            <span {...api().getHeaderTitleProps()}>{api().visibleRangeText.formatted}</span>
          </div>

          <div class="scheduler-time-grid-wrapper">
            <div {...api().getColumnHeadersProps()}>
              <div class="scheduler-gutter-header" />
              <Index each={api().columns}>
                {(column) => (
                  <div {...api().getColumnHeaderProps(column())}>
                    <span class="scheduler-header-day-label">{column().resource?.title}</span>
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

                  <Index each={api().columns}>
                    {(column) => (
                      <div {...api().getDayColumnProps(column())}>
                        <Index each={api().hourRange.hours}>
                          {(hour) => <div {...api().getHourLineProps({ hour: hour() })} />}
                        </Index>
                        <Index each={api().getEventsForColumn(column())}>
                          {(event) => (
                            <div {...api().getEventProps({ event: event() })}>
                              <div class="scheduler-event-title">{event().title}</div>
                              <div {...api().getEventResizeHandleProps({ event: event(), edge: "end" })}>
                                <div class="scheduler-resize-grip" />
                              </div>
                            </div>
                          )}
                        </Index>
                        <div {...api().getDragOriginProps(column())} />
                        <div {...api().getDragPreviewProps(column())}>
                          <div class="scheduler-event-title">{api().dragState?.event.title}</div>
                        </div>
                      </div>
                    )}
                  </Index>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div data-testid="drop-log">{log().join(" ")}</div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
