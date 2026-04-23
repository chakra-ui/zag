<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import type { DateValue } from "@internationalized/date"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const TODAY = scheduler.getToday()

  let view = $state<scheduler.ViewType>("week")
  let date = $state<DateValue>(TODAY)
  let events = $state<scheduler.SchedulerEvent[]>([
    {
      id: "1",
      title: "Sprint planning",
      start: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 0 }),
      end: TODAY.subtract({ days: 4 }).set({ hour: 10, minute: 0 }),
      color: "#3b82f6",
    },
    {
      id: "2",
      title: "Interview",
      start: TODAY.subtract({ days: 3 }).set({ hour: 11, minute: 0 }),
      end: TODAY.subtract({ days: 3 }).set({ hour: 12, minute: 0 }),
      color: "#ef4444",
    },
    {
      id: "3",
      title: "1:1 with manager",
      start: TODAY.subtract({ days: 1 }).set({ hour: 14, minute: 0 }),
      end: TODAY.subtract({ days: 1 }).set({ hour: 14, minute: 30 }),
      color: "#10b981",
    },
  ])
  let selectedTitle = $state<string | null>(null)

  const controls = useControls(schedulerControls)
  const id = $props.id()

  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>({
      id,
      get view() {
        return view
      },
      get date() {
        return date
      },
      get events() {
        return events
      },
      onViewChange: (d) => (view = d.view),
      onDateChange: (d) => (date = d.date),
      onEventClick: (d) => (selectedTitle = d.event.title ?? null),
      onEventDragEnd: (d) => (events = d.apply(events)),
      onEventResizeEnd: (d) => (events = d.apply(events)),
    }),
  )

  const api = $derived(scheduler.connect(service, normalizeProps))
  const viewOptions: scheduler.ViewType[] = ["day", "week"]
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

    <div style="font-size:13px;color:#6b7280;margin-bottom:4px">
      View: <strong>{view}</strong> · {events.length} events
      {#if selectedTitle}
        · Selected: <strong>{selectedTitle}</strong>
      {/if}
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
              {@const origin = api.getDragOrigin({ date: d })}
              {@const ghost = api.getDragGhost({ date: d })}
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
