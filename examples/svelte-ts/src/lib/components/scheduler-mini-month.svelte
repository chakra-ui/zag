<script lang="ts">
  import type * as scheduler from "@zag-js/scheduler"

  interface Props {
    api: scheduler.Api
    month: number
    weekDays: scheduler.WeekDay[]
  }

  const { api, month, weekDays }: Props = $props()

  const reference = $derived(api.date.set({ month, day: 1 }))
  const weeks = $derived(api.getMonthGrid(reference))
</script>

<section class="scheduler-mini-month">
  <h3 class="scheduler-mini-month-title">{api.getMonthName(reference)}</h3>
  <div {...api.getMonthGridProps({ date: reference })}>
    <div {...api.getWeekdayHeaderRowProps()} class="scheduler-mini-weekdays">
      {#each weekDays as day (day.long)}
        <div {...api.getWeekdayHeaderCellProps({ day })}>
          {day.narrow}
        </div>
      {/each}
    </div>
    {#each weeks as week}
      <div {...api.getWeekRowProps()} class="scheduler-mini-week">
        {#each week as date (date.toString())}
          {@const dayEvents = api.getEventsForDay(date)}
          <div {...api.getDayCellProps({ date, referenceDate: reference })}>
            <div {...api.getDayCellTriggerProps({ date, referenceDate: reference })} class="scheduler-mini-day">
              <span aria-hidden="true">{date.day}</span>
              {#if dayEvents.length > 0}
                <span aria-hidden="true" class="scheduler-mini-dot" style:background={dayEvents[0].color ?? "#3b82f6"}
                ></span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/each}
  </div>
</section>
