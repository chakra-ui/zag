import { CalendarDateTime } from "@internationalized/date"
import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, Show, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

const INITIAL: scheduler.SchedulerEvent[] = Array.from({ length: 12 }, (_, m) => ({
  id: `evt-${m}`,
  title: `Meeting ${m + 1}`,
  start: new CalendarDateTime(2026, m + 1, 10 + (m % 15), 10, 0),
  end: new CalendarDateTime(2026, m + 1, 10 + (m % 15), 11, 0),
  color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][m % 5],
}))

export default function Page() {
  const controls = useControls(schedulerControls)
  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>(() => ({
      id: createUniqueId(),
      defaultDate: INITIAL[0].start,
      view: "year",
      events: INITIAL,
    })),
  )
  const api = createMemo(() => scheduler.connect(service, normalizeProps))

  return (
    <>
      <main class="scheduler">
        <div {...api().getRootProps()}>
          <div {...api().getHeaderProps()}>
            <button {...api().getPrevTriggerProps()}>{api().prevTriggerIcon}</button>
            <button {...api().getTodayTriggerProps()}>{api().todayTriggerLabel}</button>
            <button {...api().getNextTriggerProps()}>{api().nextTriggerIcon}</button>
            <span {...api().getHeaderTitleProps()}>{api().date.year}</span>
          </div>

          <div class="scheduler-year-grid">
            <Index each={api().monthNames}>
              {(_, i) => {
                const reference = () => api().date.set({ month: i + 1, day: 1 })
                return (
                  <div class="scheduler-mini-month">
                    <div class="scheduler-mini-month-title">{api().getMonthName(reference())}</div>
                    <div class="scheduler-mini-weekdays">
                      <Index each={api().weekDays}>{(d) => <div>{d().narrow}</div>}</Index>
                    </div>
                    <Index each={api().getMonthGrid(reference())}>
                      {(week) => (
                        <div class="scheduler-mini-week">
                          <Index each={week()}>
                            {(cell) => (
                              <div
                                {...api().getDayCellProps({ date: cell().date, referenceDate: reference() })}
                                class="scheduler-mini-day"
                              >
                                <span>{cell().date.day}</span>
                                <Show when={api().getEventsForDay(cell().date).length > 0}>
                                  <span
                                    class="scheduler-mini-dot"
                                    style={{ background: api().getEventsForDay(cell().date)[0].color ?? "#3b82f6" }}
                                  />
                                </Show>
                              </div>
                            )}
                          </Index>
                        </div>
                      )}
                    </Index>
                  </div>
                )
              }}
            </Index>
          </div>
        </div>
      </main>
      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
