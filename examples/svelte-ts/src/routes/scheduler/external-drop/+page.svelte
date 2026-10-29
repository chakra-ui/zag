<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { startOfWeek } from "@internationalized/date"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerAnchor, schedulerBacklog } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/scheduler.css"

  const TODAY = schedulerAnchor
  const WEEK = startOfWeek(TODAY, "en-US")

  let events = $state.raw<scheduler.SchedulerEvent[]>([])
  let backlog = $state.raw(schedulerBacklog)

  const id = $props.id()
  const service = useMachine(scheduler.machine, (): scheduler.Props => ({
    id,
    defaultView: "day",
    defaultDate: WEEK.add({ days: 2 }),
    dayStartHour: 8,
    dayEndHour: 18,
    events,
    onEventReceive(details) {
      const item = backlog.find((b) => b.id === details.data)
      if (!item) return
      backlog = backlog.filter((b) => b.id !== item.id)
      events = [
        ...events,
        {
          id: item.id,
          title: item.title,
          start: details.start,
          end: details.end,
          allDay: details.allDay,
          color: details.allDay ? "#8b5cf6" : "#3b82f6",
        },
      ]
    },
  }))

  const api = $derived(scheduler.connect(service, normalizeProps))
</script>

<main class="scheduler">
  <p>Drag an item from the backlog onto the grid.</p>

  <ul class="scheduler-backlog" data-testid="backlog">
    {#each backlog as item (item.id)}
      <li>
        <button
          type="button"
          draggable="true"
          data-testid={`backlog-${item.id}`}
          ondragstart={(event) => event.dataTransfer?.setData("text/plain", item.id)}
        >
          {item.title}
        </button>
      </li>
    {/each}
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

      <div {...api.getAllDayRowProps()}>
        <div {...api.getAllDayLabelProps()}>All day</div>
        {#each api.visibleDays as date, index (`ad-${date.toString()}`)}
          <div
            {...mergeProps(api.getDayCellProps({ date, allDay: true }), {
              style: { zIndex: api.visibleDays.length - index },
            })}
          >
            {#each api.getAllDaySegments().filter((segment) => segment.column === index) as segment (segment.event.id)}
              <div {...api.getEventProps({ event: segment.event, layout: "all-day", segment })}>
                {segment.event.title}
              </div>
            {/each}
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
                {#each api.getEventsForColumn(column).filter((e) => !e.allDay) as event (event.id)}
                  <div {...api.getEventProps({ event })}>
                    <div class="scheduler-event-title">{event.title}</div>
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
