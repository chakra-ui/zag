<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import type { CalendarDateTime } from "@internationalized/date"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerAnchor, schedulerControls, schedulerEvents } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronLeftIcon, ChevronRightIcon } from "lucide-svelte"
  import "@styles/scheduler.css"

  const controls = useControls(schedulerControls)
  let selectedDate = $state.raw<CalendarDateTime>(schedulerAnchor)

  const id = $props.id()
  const controlProps = controls.mergeProps<scheduler.Props>({ id })
  const service = useMachine(scheduler.machine, (): scheduler.Props => ({
    ...controlProps(),
    view: "month",
    defaultDate: schedulerAnchor,
    events: schedulerEvents,
  }))

  const api = $derived(scheduler.connect(service, normalizeProps))
  const weeks = $derived(api.getMonthGrid(api.date))
  const selectedDayEvents = $derived(api.getEventsForDay(selectedDate))
</script>

<main class="scheduler">
  <div {...mergeProps(api.getRootProps(), { style: { maxWidth: "420px" } })}>
    <div {...api.getHeaderProps()}>
      <button {...api.getPreviousTriggerProps()}>
        <ChevronLeftIcon />
      </button>
      <span {...api.getHeaderTitleProps()}>
        {api.getMonthName(api.date)}
        {api.date.year}
      </span>
      <button {...api.getNextTriggerProps()}>
        <ChevronRightIcon />
      </button>
    </div>

    <div class="scheduler-mobile-month">
      <div class="scheduler-mobile-weekdays">
        {#each api.getWeekDays() as day}
          <div>{day.short}</div>
        {/each}
      </div>
      {#each weeks as week}
        <div class="scheduler-mobile-week">
          {#each week as date (date.toString())}
            {@const isSelected = date.compare(selectedDate) === 0}
            {@const dayEvents = api.getEventsForDay(date)}
            <button
              type="button"
              {...api.getDayCellProps({ date, referenceDate: api.date })}
              class="scheduler-mobile-day"
              data-selected={isSelected || undefined}
              onclick={() => (selectedDate = date as CalendarDateTime)}
              aria-label={api.formatLongDate(date)}
            >
              <span class="scheduler-mobile-day-num">{date.day}</span>
              <span class="scheduler-mobile-dots">
                {#each dayEvents.slice(0, 3) as e (e.id)}
                  <span class="scheduler-mobile-dot" style:background={e.color ?? "#3b82f6"}></span>
                {/each}
              </span>
            </button>
          {/each}
        </div>
      {/each}
    </div>

    <div class="scheduler-mobile-agenda">
      <div {...api.getAgendaGroupTitleProps({ date: selectedDate })}>{api.formatLongDate(selectedDate)}</div>
      {#if selectedDayEvents.length === 0}
        <div class="scheduler-mobile-agenda-empty">No events</div>
      {:else}
        {#each selectedDayEvents as event (event.id)}
          <div {...api.getEventProps({ event, layout: "list" })}>
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
