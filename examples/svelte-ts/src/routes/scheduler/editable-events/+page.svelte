<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { startOfWeek } from "@internationalized/date"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerAnchor } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/scheduler.css"

  const TODAY = schedulerAnchor
  const WEEK = startOfWeek(TODAY, "en-US")
  const DAY = WEEK.add({ days: 2 })

  const INITIAL: scheduler.SchedulerEvent[] = [
    // freely editable
    { id: "movable", title: "Movable", start: DAY.set({ hour: 9 }), end: DAY.set({ hour: 10 }), color: "#3b82f6" },
    // locked via the `disabled` flag
    { id: "locked", title: "Locked", start: DAY.set({ hour: 11 }), end: DAY.set({ hour: 12 }), disabled: true },
    // draggable but not resizable, decided by the predicates below
    { id: "fixed-length", title: "Fixed length", start: DAY.set({ hour: 14 }), end: DAY.set({ hour: 15 }) },
    // these two overlap, so both report a conflict
    { id: "conflict-a", title: "Conflict A", start: DAY.set({ hour: 16 }), end: DAY.set({ hour: 17 }) },
    { id: "conflict-b", title: "Conflict B", start: DAY.set({ hour: 16, minute: 30 }), end: DAY.set({ hour: 17 }) },
  ]

  let events = $state.raw(INITIAL)

  const id = $props.id()
  const service = useMachine(scheduler.machine, (): scheduler.Props => ({
    id,
    defaultView: "day",
    defaultDate: DAY,
    dayStartHour: 8,
    dayEndHour: 19,
    events,
    canDragEvent: (event) => !event.disabled,
    canResizeEvent: (event) => !event.disabled && event.id !== "fixed-length",
    onEventDrop(details) {
      events = events.map((e) =>
        e.id === details.event.id ? { ...e, start: details.newStart, end: details.newEnd } : e,
      )
    },
  }))

  const api = $derived(scheduler.connect(service, normalizeProps))
</script>

<main class="scheduler">
  <ul>
    <li>Movable — drag and resize</li>
    <li>Locked — `disabled`, neither</li>
    <li>Fixed length — drag only, `canResizeEvent` says no</li>
    <li>Conflict A / B — overlap, so `hasConflict` is true for both</li>
  </ul>

  <div {...api.getRootProps()}>
    <div class="scheduler-time-grid-wrapper">
      <div {...api.getColumnHeadersProps()}>
        <div class="scheduler-gutter-header"></div>
        {#each api.columns as column (column.date.toString())}
          <div {...api.getColumnHeaderProps(column)}>
            <span class="scheduler-header-day-label">{api.formatWeekDay(column.date)}</span>
          </div>
        {/each}
      </div>

      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <div class="scheduler-time-grid-scroll" tabindex="0" aria-label="Schedule grid">
        <div {...api.getGridProps()}>
          <div {...api.getGridRowProps()}>
            <div {...api.getTimeGutterProps()}>
              {#each api.hourRange.hours as hour (hour.value)}
                <div {...api.getHourLabelProps({ hour })}>
                  {hour.label}
                </div>
              {/each}
            </div>
            {#each api.columns as column (column.date.toString())}
              <div {...api.getDayColumnProps(column)}>
                {#each api.hourRange.hours as hour (hour.value)}
                  <div {...api.getHourLineProps({ hour })}></div>
                {/each}
                {#each api.getEventsForColumn(column) as event (event.id)}
                  <div {...api.getEventProps({ event })} data-conflicting={api.hasConflict(event)}>
                    <div class="scheduler-event-title">{event.title}</div>
                    <div {...api.getEventResizeHandleProps({ event, edge: "end" })}>
                      <div class="scheduler-resize-grip"></div>
                    </div>
                  </div>
                {/each}
                <div {...api.getDragOriginProps(column)}></div>
                <div {...api.getDragPreviewProps(column)}>
                  <div class="scheduler-event-title">{api.dragState?.event.title}</div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
