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
      title: "Daily standup",
      start: TODAY.subtract({ days: 2 }).set({ hour: 9, minute: 30 }),
      end: TODAY.subtract({ days: 2 }).set({ hour: 10, minute: 0 }),
      color: "#3b82f6",
    },
    {
      id: "2",
      title: "Design review",
      start: TODAY.subtract({ days: 1 }).set({ hour: 11, minute: 0 }),
      end: TODAY.subtract({ days: 1 }).set({ hour: 12, minute: 30 }),
      color: "#10b981",
    },
    {
      id: "3",
      title: "Friday demo",
      start: TODAY.add({ days: 2 }).set({ hour: 15, minute: 0 }),
      end: TODAY.add({ days: 2 }).set({ hour: 16, minute: 0 }),
      color: "#f59e0b",
    },
  ])

  const controls = useControls(schedulerControls)
  const id = $props.id()
  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>({
      id,
      weekStartDay: 1,
      workWeekDays: [1, 2, 3, 4, 5],
      workWeekOnly: true,
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
      <span {...api.getHeaderTitleProps()}>Work Week · {api.visibleRangeText.formatted}</span>
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
              {#each api.getEventsForDay(d) as event (event.id)}
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
