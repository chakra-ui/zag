import { CalendarDateTime } from "@internationalized/date"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronLeft, ChevronRight } from "lucide-solid"
import { Index, Show, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/scheduler.css"

const INITIAL: scheduler.SchedulerEvent[] = Array.from({ length: 12 }, (_, m) => ({
  id: `evt-${m}`,
  title: `Meeting ${m + 1}`,
  start: new CalendarDateTime(schedulerAnchor.year, m + 1, 10 + (m % 15), 10, 0),
  end: new CalendarDateTime(schedulerAnchor.year, m + 1, 10 + (m % 15), 11, 0),
  color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][m % 5],
}))

function MiniMonth(props: { api: scheduler.Api; month: number; weekDays: scheduler.WeekDay[] }) {
  const reference = createMemo(() => props.api.date.set({ month: props.month, day: 1 }))
  const weeks = createMemo(() => props.api.getMonthGrid(reference()))
  return (
    <section class="scheduler-mini-month">
      <h3 class="scheduler-mini-month-title">{props.api.getMonthName(reference())}</h3>
      <div {...props.api.getMonthGridProps({ date: reference() })}>
        <div {...props.api.getWeekdayHeaderRowProps()} class="scheduler-mini-weekdays">
          <Index each={props.weekDays}>
            {(day) => <div {...props.api.getWeekdayHeaderCellProps({ day: day() })}>{day().narrow}</div>}
          </Index>
        </div>
        <Index each={weeks()}>
          {(week) => (
            <div {...props.api.getWeekRowProps()} class="scheduler-mini-week">
              <Index each={week()}>
                {(date) => {
                  const dayEvents = createMemo(() => props.api.getEventsForDay(date()))
                  return (
                    <div {...props.api.getDayCellProps({ date: date(), referenceDate: reference() })}>
                      <div
                        {...props.api.getDayCellTriggerProps({ date: date(), referenceDate: reference() })}
                        class="scheduler-mini-day"
                      >
                        <span aria-hidden>{date().day}</span>
                        <Show when={dayEvents().length > 0}>
                          <span
                            aria-hidden
                            class="scheduler-mini-dot"
                            style={{ background: dayEvents()[0].color ?? "#3b82f6" }}
                          />
                        </Show>
                      </div>
                    </div>
                  )
                }}
              </Index>
            </div>
          )}
        </Index>
      </div>
    </section>
  )
}

export default function Page() {
  const controls = useControls(schedulerControls)
  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>({
      id: createUniqueId(),
      defaultDate: INITIAL[0].start,
      startOfWeek: 1,
      view: "year",
      events: INITIAL,
    }),
  )

  const api = createMemo(() => scheduler.connect(service, normalizeProps))
  const weekDays = createMemo(() => api().getWeekDays())

  return (
    <>
      <main class="scheduler scheduler-year-page">
        <div {...api().getRootProps()}>
          <div {...api().getHeaderProps()}>
            <span {...api().getHeaderTitleProps()}>{api().date.year}</span>
            <div class="scheduler-year-nav">
              <button {...api().getPrevTriggerProps()} aria-label="Previous year">
                <ChevronLeft />
              </button>
              <button {...api().getTodayTriggerProps()}>Today</button>
              <button {...api().getNextTriggerProps()} aria-label="Next year">
                <ChevronRight />
              </button>
            </div>
          </div>

          <div class="scheduler-year-grid">
            <Index each={api().getMonthNames()}>
              {(_, i) => <MiniMonth api={api()} month={i + 1} weekDays={weekDays()} />}
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
