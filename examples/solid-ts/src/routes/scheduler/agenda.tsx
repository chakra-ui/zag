import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, Show, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

const TODAY = scheduler.getToday()

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Team standup",
    start: TODAY.set({ hour: 9, minute: 0 }),
    end: TODAY.set({ hour: 9, minute: 30 }),
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Design review",
    start: TODAY.add({ days: 1 }).set({ hour: 10, minute: 0 }),
    end: TODAY.add({ days: 1 }).set({ hour: 11, minute: 30 }),
    color: "#10b981",
  },
  {
    id: "3",
    title: "1:1 with manager",
    start: TODAY.add({ days: 3 }).set({ hour: 15, minute: 0 }),
    end: TODAY.add({ days: 3 }).set({ hour: 16, minute: 0 }),
    color: "#8b5cf6",
  },
  {
    id: "4",
    title: "Sprint planning",
    start: TODAY.add({ days: 5 }).set({ hour: 13, minute: 0 }),
    end: TODAY.add({ days: 5 }).set({ hour: 14, minute: 30 }),
    color: "#f59e0b",
  },
  {
    id: "5",
    title: "Demo day",
    start: TODAY.add({ days: 7 }).set({ hour: 14, minute: 0 }),
    end: TODAY.add({ days: 7 }).set({ hour: 15, minute: 30 }),
    color: "#ef4444",
  },
  {
    id: "6",
    title: "Quarterly review",
    start: TODAY.add({ days: 17 }).set({ hour: 11, minute: 0 }),
    end: TODAY.add({ days: 17 }).set({ hour: 12, minute: 0 }),
    color: "#ec4899",
  },
]

export default function Page() {
  const controls = useControls(schedulerControls)

  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>(() => ({
      id: createUniqueId(),
      view: "agenda",
      events: INITIAL,
    })),
  )

  const api = createMemo(() => scheduler.connect(service, normalizeProps))

  return (
    <>
      <main class="scheduler">
        <div {...api().getRootProps()} style={{ "max-width": "520px" }}>
          <div {...api().getHeaderProps()}>
            <button {...api().getPrevTriggerProps()}>{api().prevTriggerIcon}</button>
            <button {...api().getTodayTriggerProps()}>{api().todayTriggerLabel}</button>
            <button {...api().getNextTriggerProps()}>{api().nextTriggerIcon}</button>
            <span {...api().getHeaderTitleProps()}>{api().visibleRangeText.formatted}</span>
          </div>

          <div class="scheduler-mobile-agenda">
            <Show
              when={api().agendaGroups.length > 0}
              fallback={
                <div class="scheduler-mobile-agenda-empty">
                  No events between {api().formatLongDate(api().visibleRange.start)} and{" "}
                  {api().formatLongDate(api().visibleRange.end)}
                </div>
              }
            >
              <Index each={api().agendaGroups}>
                {(group) => (
                  <div class="scheduler-agenda-group">
                    <div class="scheduler-mobile-agenda-title">{api().formatLongDate(group().date)}</div>
                    <Index each={group().events}>
                      {(event) => (
                        <div
                          {...api().getEventProps({ event: event() })}
                          class="scheduler-mobile-agenda-event"
                          style={{ "--event-color": event().color ?? "#3b82f6" }}
                        >
                          <div class="scheduler-mobile-agenda-time">
                            {api().formatTimeRange(event().start, event().end)}
                          </div>
                          <div class="scheduler-event-title">{event().title}</div>
                        </div>
                      )}
                    </Index>
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
