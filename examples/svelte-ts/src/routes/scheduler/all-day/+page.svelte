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
      id: "conf",
      title: "DevConf 2026",
      start: TODAY.subtract({ days: 3 }),
      end: TODAY.subtract({ days: 1 }),
      allDay: true,
      color: "#6366f1",
    },
    { id: "holiday", title: "Company holiday", start: TODAY, end: TODAY, allDay: true, color: "#ef4444" },
    {
      id: "standup",
      title: "Team standup",
      start: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 0 }),
      end: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 30 }),
      color: "#3b82f6",
    },
    {
      id: "demo",
      title: "Sprint demo",
      start: TODAY.subtract({ days: 2 }).set({ hour: 14, minute: 0 }),
      end: TODAY.subtract({ days: 2 }).set({ hour: 15, minute: 0 }),
      color: "#10b981",
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
    }),
  )
  const api = $derived(scheduler.connect(service, normalizeProps))
</script>

<main class="scheduler">
  <div {...api.getRootProps()}>
    <div {...api.getHeaderProps()}>
      <button {...api.getPrevTriggerProps()}>{api.prevTriggerIcon}</button>
      <button {...api.getTodayTriggerProps()}>{api.todayTriggerLabel}</button>
      <button {...api.getNextTriggerProps()}>{api.nextTriggerIcon}</button>
      <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
    </div>

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

      <div {...api.getAllDayRowProps()} class="scheduler-all-day-row">
        <div class="scheduler-all-day-label">All day</div>
        {#each api.visibleDays as d (d.toString())}
          <div class="scheduler-all-day-cell">
            {#each api.getEventsForDay(d).filter((e) => e.allDay) as event (event.id)}
              <div
                {...api.getEventProps({ event })}
                class="scheduler-all-day-event"
                style="--event-color: {event.color ?? '#3b82f6'}"
              >
                {event.title}
              </div>
            {/each}
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
            {@const origin = api.getDragOrigin({ date: d })}
            {@const ghost = api.getDragGhost({ date: d })}
            <div {...api.getDayColumnProps({ date: d })}>
              {#each api.hourRange.hours as h (h.value)}
                <div class="scheduler-hour-line" style={h.style}></div>
              {/each}
              {#each api.getEventsForDay(d).filter((e) => !e.allDay) as event (event.id)}
                <div {...api.getEventProps({ event })}>
                  <div class="scheduler-event-title">{event.title}</div>
                  <div {...api.getEventResizeHandleProps({ event, edge: "end" })} class="scheduler-resize-handle">
                    <div class="scheduler-resize-grip"></div>
                  </div>
                </div>
              {/each}
              {#if origin}<div {...origin.props}></div>{/if}
              {#if ghost}
                <div {...ghost.props}>
                  <div class="scheduler-event-title">{ghost.event.title}</div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
