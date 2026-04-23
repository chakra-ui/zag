<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import type { DateValue } from "@internationalized/date"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

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

  let selectedDate = $state<DateValue>(TODAY)
  const controls = useControls(schedulerControls)
  const id = $props.id()
  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>({ id, view: "month", events: INITIAL }),
  )
  const api = $derived(scheduler.connect(service, normalizeProps))
</script>

<main class="scheduler">
  <div {...api.getRootProps()} style="max-width:420px">
    <div {...api.getHeaderProps()}>
      <button {...api.getPrevTriggerProps()}>{api.prevTriggerIcon}</button>
      <span {...api.getHeaderTitleProps()}>{api.getMonthName(api.date)} {api.date.year}</span>
      <button {...api.getNextTriggerProps()}>{api.nextTriggerIcon}</button>
    </div>

    <div class="scheduler-mobile-month">
      <div class="scheduler-mobile-weekdays">
        {#each api.weekDays as d, i (i)}
          <div>{d.short}</div>
        {/each}
      </div>
      {#each api.getMonthGrid(api.date) as week, wi (wi)}
        <div class="scheduler-mobile-week">
          {#each week as cell (cell.date.toString())}
            <button
              type="button"
              {...api.getDayCellProps({ date: cell.date, referenceDate: api.date })}
              class="scheduler-mobile-day"
              data-selected={cell.date.compare(selectedDate) === 0 || undefined}
              aria-label={api.formatLongDate(cell.date)}
              onclick={() => (selectedDate = cell.date)}
            >
              <span class="scheduler-mobile-day-num">{cell.date.day}</span>
              <span class="scheduler-mobile-dots">
                {#each api.getEventsForDay(cell.date).slice(0, 3) as e (e.id)}
                  <span class="scheduler-mobile-dot" style="background: {e.color ?? '#3b82f6'}"></span>
                {/each}
              </span>
            </button>
          {/each}
        </div>
      {/each}
    </div>

    <div class="scheduler-mobile-agenda">
      <div class="scheduler-mobile-agenda-title">{api.formatLongDate(selectedDate)}</div>
      {#if api.getEventsForDay(selectedDate).length === 0}
        <div class="scheduler-mobile-agenda-empty">No events</div>
      {:else}
        {#each api.getEventsForDay(selectedDate) as event (event.id)}
          <div
            {...api.getEventProps({ event })}
            class="scheduler-mobile-agenda-event"
            style="--event-color: {event.color ?? '#3b82f6'}"
          >
            <div class="scheduler-mobile-agenda-time">{api.formatTimeRange(event.start, event.end)}</div>
            <div class="scheduler-event-title">{event.title}</div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
