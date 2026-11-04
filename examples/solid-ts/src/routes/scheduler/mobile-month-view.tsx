import type { CalendarDateTime } from "@internationalized/date"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls, schedulerEvents } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronLeft, ChevronRight } from "lucide-solid"
import { For, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/scheduler.css"

export default function Page() {
  const controls = useControls(schedulerControls)
  const [selectedDate, setSelectedDate] = createSignal<CalendarDateTime>(schedulerAnchor)

  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>({
      id: createUniqueId(),
      view: "month",
      defaultDate: schedulerAnchor,
      events: schedulerEvents,
    }),
  )

  const api = createMemo(() => scheduler.connect(service, normalizeProps))
  const weeks = createMemo(() => api().getMonthGrid(api().date))
  const selectedDayEvents = createMemo(() => api().getEventsForDay(selectedDate()))

  return (
    <>
      <main class="scheduler">
        <div {...mergeProps(api().getRootProps(), { style: { "max-width": "420px" } })}>
          <div {...api().getHeaderProps()}>
            <button {...api().getPreviousTriggerProps()}>
              <ChevronLeft />
            </button>
            <span {...api().getHeaderTitleProps()}>
              {api().getMonthName(api().date)} {api().date.year}
            </span>
            <button {...api().getNextTriggerProps()}>
              <ChevronRight />
            </button>
          </div>

          <div class="scheduler-mobile-month">
            <div class="scheduler-mobile-weekdays">
              <For keyed={false} each={api().getWeekDays()}>
                {(day) => <div>{day().short}</div>}
              </For>
            </div>
            <For keyed={false} each={weeks()}>
              {(week) => (
                <div class="scheduler-mobile-week">
                  <For keyed={false} each={week()}>
                    {(date) => {
                      const isSelected = () => date().compare(selectedDate()) === 0
                      const dayEvents = createMemo(() => api().getEventsForDay(date()))
                      return (
                        <button
                          type="button"
                          {...api().getDayCellProps({ date: date(), referenceDate: api().date })}
                          class="scheduler-mobile-day"
                          data-selected={isSelected() || undefined}
                          onClick={() => setSelectedDate(date())}
                          aria-label={api().formatLongDate(date())}
                        >
                          <span class="scheduler-mobile-day-num">{date().day}</span>
                          <span class="scheduler-mobile-dots">
                            <For keyed={false} each={dayEvents().slice(0, 3)}>
                              {(e) => (
                                <span class="scheduler-mobile-dot" style={{ background: e().color ?? "#3b82f6" }} />
                              )}
                            </For>
                          </span>
                        </button>
                      )
                    }}
                  </For>
                </div>
              )}
            </For>
          </div>

          <div class="scheduler-mobile-agenda">
            <div {...api().getAgendaGroupTitleProps({ date: selectedDate() })}>
              {api().formatLongDate(selectedDate())}
            </div>
            <Show
              when={selectedDayEvents().length > 0}
              fallback={<div class="scheduler-mobile-agenda-empty">No events</div>}
            >
              <For keyed={false} each={selectedDayEvents()}>
                {(event) => (
                  <div {...api().getEventProps({ event: event(), layout: "list" })}>
                    <div class="scheduler-mobile-agenda-time">{api().formatTimeRange(event().start, event().end)}</div>
                    <div class="scheduler-event-title">{event().title}</div>
                  </div>
                )}
              </For>
            </Show>
          </div>
        </div>
      </main>
      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
