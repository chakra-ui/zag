import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls, schedulerEvents } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronLeft, ChevronRight } from "lucide-solid"
import { For, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/scheduler.css"

export default function Page() {
  const controls = useControls(schedulerControls)
  const [events, setEvents] = createSignal(schedulerEvents)

  const id = createUniqueId()
  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>(() => ({
      id,
      defaultDate: schedulerAnchor,
      events: events(),
      onEventClick: (d) => console.log("event clicked", d),
      onEventDrop: (d) => {
        console.log("event dropped", d)
        setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e)))
      },
      onEventResize: (d) => {
        console.log("event resized", d)
        setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e)))
      },
    })),
  )

  const api = createMemo(() => scheduler.connect(service, normalizeProps))

  return (
    <>
      <main class="scheduler">
        <div {...api().getRootProps()}>
          <div {...api().getHeaderProps()}>
            <button {...api().getPreviousTriggerProps()}>
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
              <For keyed={false} each={api().visibleDays}>
                {(date) => (
                  <div {...api().getColumnHeaderProps({ date: date() })}>
                    <span class="scheduler-header-day-label">{api().formatWeekDay(date())}</span>
                    <span class="scheduler-header-day-num">{date().day}</span>
                  </div>
                )}
              </For>
            </div>

            <div class="scheduler-time-grid-scroll" tabindex={0} role="group" aria-label="Time grid">
              <div {...api().getGridProps()}>
                <div {...api().getGridRowProps()}>
                  <div {...api().getTimeGutterProps()}>
                    <For keyed={false} each={api().hourRange.hours}>
                      {(hour) => <div {...api().getHourLabelProps({ hour: hour() })}>{hour().label}</div>}
                    </For>
                  </div>

                  <For keyed={false} each={api().visibleDays}>
                    {(date) => (
                      <div {...api().getDayColumnProps({ date: date() })}>
                        <For keyed={false} each={api().hourRange.hours}>
                          {(hour) => <div {...api().getHourLineProps({ hour: hour() })} />}
                        </For>
                        <div {...api().getCurrentTimeIndicatorProps({ date: date() })} />
                        <For keyed={false} each={api().getEventsForDay(date())}>
                          {(event) => (
                            <div {...api().getEventProps({ event: event() })}>
                              <div class="scheduler-event-title">{event().title}</div>
                              <div {...api().getEventResizeHandleProps({ event: event(), edge: "end" })}>
                                <div class="scheduler-resize-grip" />
                              </div>
                            </div>
                          )}
                        </For>
                        <div {...api().getDragOriginProps({ date: date() })} />
                        <div {...api().getDragPreviewProps({ date: date() })}>
                          <div class="scheduler-event-title">{api().dragState?.event.title}</div>
                        </div>
                      </div>
                    )}
                  </For>
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
