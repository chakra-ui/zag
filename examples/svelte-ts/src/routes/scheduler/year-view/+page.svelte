<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { CalendarDateTime } from "@internationalized/date"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const INITIAL: scheduler.SchedulerEvent[] = Array.from({ length: 12 }, (_, m) => ({
    id: `evt-${m}`,
    title: `Meeting ${m + 1}`,
    start: new CalendarDateTime(2026, m + 1, 10 + (m % 15), 10, 0),
    end: new CalendarDateTime(2026, m + 1, 10 + (m % 15), 11, 0),
    color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][m % 5],
  }))

  const controls = useControls(schedulerControls)
  const id = $props.id()
  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>({
      id,
      defaultDate: INITIAL[0].start,
      view: "year",
      events: INITIAL,
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
      <span {...api.getHeaderTitleProps()}>{api.date.year}</span>
    </div>

    <div class="scheduler-year-grid">
      {#each api.monthNames as _, i (i)}
        {@const reference = api.date.set({ month: i + 1, day: 1 })}
        <div class="scheduler-mini-month">
          <div class="scheduler-mini-month-title">{api.getMonthName(reference)}</div>
          <div class="scheduler-mini-weekdays">
            {#each api.weekDays as d, di (di)}
              <div>{d.narrow}</div>
            {/each}
          </div>
          {#each api.getMonthGrid(reference) as week, wi (wi)}
            <div class="scheduler-mini-week">
              {#each week as cell (cell.date.toString())}
                {@const dayEvents = api.getEventsForDay(cell.date)}
                <div
                  {...api.getDayCellProps({ date: cell.date, referenceDate: reference })}
                  class="scheduler-mini-day"
                >
                  <span>{cell.date.day}</span>
                  {#if dayEvents.length > 0}
                    <span class="scheduler-mini-dot" style="background: {dayEvents[0].color ?? '#3b82f6'}"></span>
                  {/if}
                </div>
              {/each}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
