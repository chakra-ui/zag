<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { startOfWeek, toCalendarDate } from "@internationalized/date"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerAnchor } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/scheduler.css"

  const ZONES = ["UTC", "America/New_York", "Europe/Berlin", "Asia/Tokyo"]

  const TODAY = schedulerAnchor
  const WEEK = startOfWeek(TODAY, "en-US")

  const EVENTS: scheduler.SchedulerEvent[] = [
    {
      id: "1",
      title: "Global standup",
      start: WEEK.add({ days: 2 }).set({ hour: 9 }),
      end: WEEK.add({ days: 2 }).set({ hour: 10 }),
      color: "#3b82f6",
    },
  ]

  let timeZone = $state("UTC")

  const id = $props.id()
  const service = useMachine(scheduler.machine, (): scheduler.Props => ({
    id,
    defaultView: "day",
    defaultDate: WEEK.add({ days: 2 }),
    timeZone,
    events: EVENTS,
  }))

  const api = $derived(scheduler.connect(service, normalizeProps))
</script>

<main class="scheduler">
  <p>
    Event times are zoneless wall-clock values, so they read the same in every zone. What
    <code>timeZone</code> decides is which day counts as today.
  </p>

  <p>
    Today in this zone: <span data-testid="today">{toCalendarDate(api.today).toString()}</span>
  </p>

  <label>
    Time zone{" "}
    <select data-testid="zone" value={timeZone} onchange={(e) => (timeZone = e.currentTarget.value)}>
      {#each ZONES as zone (zone)}
        <option value={zone}>
          {zone}
        </option>
      {/each}
    </select>
  </label>

  <div {...api.getRootProps()}>
    <div {...api.getHeaderProps()}>
      <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
    </div>

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
                {#each api.getEventsForColumn(column) as event (event.id)}
                  <div {...api.getEventProps({ event })}>
                    <div class="scheduler-event-title">{event.title}</div>
                    <span data-testid={`time-${event.id}`}>{api.formatTimeRange(event.start, event.end)}</span>
                  </div>
                {/each}
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
