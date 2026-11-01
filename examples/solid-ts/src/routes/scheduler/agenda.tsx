import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls, schedulerEvents } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronLeft, ChevronRight } from "lucide-solid"
import { For, Index, Show, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/scheduler.css"

export default function Page() {
  const controls = useControls(schedulerControls)

  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>({
      id: createUniqueId(),
      view: "agenda",
      defaultDate: schedulerAnchor,
      events: schedulerEvents,
    }),
  )

  const api = createMemo(() => scheduler.connect(service, normalizeProps))
  const groups = createMemo(() => api().getAgendaGroups())

  return (
    <>
      <main class="scheduler">
        <div {...mergeProps(api().getRootProps(), { style: { "max-width": "520px" } })}>
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

          <div class="scheduler-mobile-agenda">
            <Show
              when={groups().length > 0}
              fallback={
                <div class="scheduler-mobile-agenda-empty">
                  No events between {api().formatLongDate(api().visibleRange.start)} and{" "}
                  {api().formatLongDate(api().visibleRange.end)}
                </div>
              }
            >
              <For each={groups()}>
                {(group) => (
                  <div {...api().getAgendaGroupProps({ date: group.date })}>
                    <div {...api().getAgendaGroupTitleProps({ date: group.date })}>
                      {api().formatLongDate(group.date)}
                    </div>
                    <Index each={group.events}>
                      {(event) => (
                        <div {...api().getEventProps({ event: event(), layout: "list" })}>
                          <div class="scheduler-mobile-agenda-time">
                            {api().formatTimeRange(event().start, event().end)}
                          </div>
                          <div class="scheduler-event-title">{event().title}</div>
                        </div>
                      )}
                    </Index>
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
