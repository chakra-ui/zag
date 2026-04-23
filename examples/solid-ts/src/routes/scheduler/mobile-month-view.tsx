import type { DateValue } from "@internationalized/date"
import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

const TODAY = scheduler.getToday()

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Team standup",
    start: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 0 }),
    end: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 30 }),
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Design review",
    start: TODAY.subtract({ days: 2 }).set({ hour: 10, minute: 0 }),
    end: TODAY.subtract({ days: 2 }).set({ hour: 11, minute: 30 }),
    color: "#10b981",
  },
  {
    id: "3",
    title: "Lunch",
    start: TODAY.set({ hour: 12, minute: 0 }),
    end: TODAY.set({ hour: 13, minute: 0 }),
    color: "#f59e0b",
  },
  {
    id: "4",
    title: "1:1 with manager",
    start: TODAY.set({ hour: 15, minute: 0 }),
    end: TODAY.set({ hour: 16, minute: 0 }),
    color: "#8b5cf6",
  },
  {
    id: "5",
    title: "Demo day",
    start: TODAY.add({ days: 7 }).set({ hour: 14, minute: 0 }),
    end: TODAY.add({ days: 7 }).set({ hour: 15, minute: 30 }),
    color: "#ef4444",
  },
]

export default function Page() {
  const controls = useControls(schedulerControls)
  const [selectedDate, setSelectedDate] = createSignal<DateValue>(TODAY)

  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>(() => ({
      id: createUniqueId(),
      view: "month",
      events: INITIAL,
    })),
  )
  const api = createMemo(() => scheduler.connect(service, normalizeProps))

  return (
    <>
      <main class="scheduler">
        <div {...api().getRootProps()} style={{ "max-width": "420px" }}>
          <div {...api().getHeaderProps()}>
            <button {...api().getPrevTriggerProps()}>{api().prevTriggerIcon}</button>
            <span {...api().getHeaderTitleProps()}>
              {api().getMonthName(api().date)} {api().date.year}
            </span>
            <button {...api().getNextTriggerProps()}>{api().nextTriggerIcon}</button>
          </div>

          <div class="scheduler-mobile-month">
            <div class="scheduler-mobile-weekdays">
              <Index each={api().weekDays}>{(d) => <div>{d().short}</div>}</Index>
            </div>
            <Index each={api().getMonthGrid(api().date)}>
              {(week) => (
                <div class="scheduler-mobile-week">
                  <Index each={week()}>
                    {(cell) => (
                      <button
                        type="button"
                        {...api().getDayCellProps({ date: cell().date, referenceDate: api().date })}
                        class="scheduler-mobile-day"
                        data-selected={cell().date.compare(selectedDate()) === 0 || undefined}
                        aria-label={api().formatLongDate(cell().date)}
                        onClick={() => setSelectedDate(cell().date)}
                      >
                        <span class="scheduler-mobile-day-num">{cell().date.day}</span>
                        <span class="scheduler-mobile-dots">
                          <Index each={api().getEventsForDay(cell().date).slice(0, 3)}>
                            {(e) => (
                              <span class="scheduler-mobile-dot" style={{ background: e().color ?? "#3b82f6" }} />
                            )}
                          </Index>
                        </span>
                      </button>
                    )}
                  </Index>
                </div>
              )}
            </Index>
          </div>

          <div class="scheduler-mobile-agenda">
            <div class="scheduler-mobile-agenda-title">{api().formatLongDate(selectedDate())}</div>
            <Show
              when={api().getEventsForDay(selectedDate()).length > 0}
              fallback={<div class="scheduler-mobile-agenda-empty">No events</div>}
            >
              <Index each={api().getEventsForDay(selectedDate())}>
                {(event) => (
                  <div
                    {...api().getEventProps({ event: event() })}
                    class="scheduler-mobile-agenda-event"
                    style={{ "--event-color": event().color ?? "#3b82f6" }}
                  >
                    <div class="scheduler-mobile-agenda-time">{api().formatTimeRange(event().start, event().end)}</div>
                    <div class="scheduler-event-title">{event().title}</div>
                  </div>
                )}
              </Index>
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
