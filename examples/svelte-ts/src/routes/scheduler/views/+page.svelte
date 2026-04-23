<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const TODAY = scheduler.getToday()
  let events = $state<scheduler.SchedulerEvent[]>([
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
      title: "Overlap A",
      start: TODAY.set({ hour: 9, minute: 15 }),
      end: TODAY.set({ hour: 10, minute: 15 }),
      color: "#ef4444",
    },
    {
      id: "5",
      title: "Overlap B",
      start: TODAY.set({ hour: 9, minute: 30 }),
      end: TODAY.set({ hour: 10, minute: 0 }),
      color: "#8b5cf6",
    },
  ])

  const controls = useControls(schedulerControls)
  const id = $props.id()
  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>({
      id,
      get events() {
        return events
      },
      onEventDragEnd: (d) => (events = d.apply(events)),
      onEventResizeEnd: (d) => (events = d.apply(events)),
      onEventClick: (d) => console.log("event clicked", d.event.title),
      onSlotSelect: (d) => console.log("slot selected", d),
    }),
  )
  const api = $derived(scheduler.connect(service, normalizeProps))
  const viewOptions: scheduler.ViewType[] = ["day", "week", "month"]
</script>

<main class="scheduler">
  <div {...api.getRootProps()}>
    <div {...api.getHeaderProps()}>
      <button {...api.getPrevTriggerProps()}>{api.prevTriggerIcon}</button>
      <button {...api.getTodayTriggerProps()}>{api.todayTriggerLabel}</button>
      <button {...api.getNextTriggerProps()}>{api.nextTriggerIcon}</button>
      <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
      <div {...api.getViewSelectProps()}>
        {#each viewOptions as v (v)}
          <button {...api.getViewItemProps({ view: v })}>{v}</button>
        {/each}
      </div>
    </div>

    {#if api.view === "month"}
      <div class="scheduler-month-grid">
        <div class="scheduler-month-header">
          {#each api.weekDays as d, i (i)}
            <div class="scheduler-header-cell">{d.short}</div>
          {/each}
        </div>
        <div class="scheduler-month-body">
          {#each api.getMonthGrid(api.date) as week, wi (wi)}
            <div class="scheduler-month-week">
              {#each week as cell (cell.date.toString())}
                {@const dayEvents = api.getEventsForDay(cell.date)}
                <div {...api.getDayCellProps({ date: cell.date, referenceDate: api.date })} class="scheduler-month-cell">
                  <div class="scheduler-month-day-number">{cell.date.day}</div>
                  {#each dayEvents.slice(0, 3) as event (event.id)}
                    <div
                      {...api.getEventProps({ event })}
                      class="scheduler-month-event"
                      style="--event-color: {event.color ?? '#3b82f6'}"
                    >
                      {String(event.title ?? "")}
                    </div>
                  {/each}
                  {#if dayEvents.length > 3}
                    <button
                      {...api.getMoreEventsProps({ date: cell.date, count: dayEvents.length - 3 })}
                      class="scheduler-more-events"
                    >
                      +{dayEvents.length - 3} more
                    </button>
                  {/if}
                </div>
              {/each}
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="scheduler-time-grid-wrapper">
        <div class="scheduler-col-headers">
          <div class="scheduler-header-cell scheduler-gutter-header"></div>
          {#each api.visibleDays as d, i (d.toString())}
            <div class="scheduler-header-cell">
              <span class="scheduler-header-day-label">{api.weekDays[i % 7].short}</span>
              <span class="scheduler-header-day-num">{d.day}</span>
            </div>
          {/each}
        </div>

        <div class="scheduler-time-grid-scroll">
          <div {...api.getGridProps()} class="scheduler-time-grid">
            <div {...api.getTimeGutterProps()}>
              {#each api.hourRange.hours as h (h.value)}
                <div class="scheduler-hour-label" style={h.style}>{h.label}</div>
              {/each}
            </div>

            {#each api.visibleDays as d (d.toString())}
              <div {...api.getDayColumnProps({ date: d })}>
                {#each api.hourRange.hours as h (h.value)}
                  <div class="scheduler-hour-line" style={h.style}></div>
                {/each}
                <div {...api.getCurrentTimeIndicatorProps()}></div>
                {#each api.getEventsForDay(d) as event (event.id)}
                  <div
                    {...api.getEventProps({ event })}
                    style="--event-color: {event.color ?? '#3b82f6'}; opacity: {api.dragPreview?.eventId === event.id
                      ? 0.25
                      : 1}; {Object.entries(api.getEventStyle(event))
                      .map(([k, v]) => `${k}:${v}`)
                      .join(';')}"
                  >
                    <div class="scheduler-event-title">{String(event.title ?? "")}</div>
                    <div class="scheduler-event-time">{event.start.toString().slice(11, 16)}</div>
                    <div {...api.getEventResizeHandleProps({ event, edge: "end" })} class="scheduler-resize-handle">
                      <div class="scheduler-resize-grip"></div>
                    </div>
                  </div>
                {/each}
                {@const ghost = api.getDragGhost({ date: d })}
                {#if ghost}
                  <div {...ghost.props}>
                    <div class="scheduler-event-title">{String(ghost.event.title ?? "")}</div>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
