<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { startOfWeek, toCalendarDateTime } from "@internationalized/date"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerAnchor } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/scheduler.css"

  const TODAY = schedulerAnchor
  const WEEK = startOfWeek(TODAY, "en-US")

  const BUSINESS_START = 9
  const BUSINESS_END = 17

  const INITIAL: scheduler.SchedulerEvent[] = [
    {
      id: "1",
      title: "Movable",
      start: WEEK.add({ days: 2 }).set({ hour: 10, minute: 0 }),
      end: WEEK.add({ days: 2 }).set({ hour: 11, minute: 0 }),
      color: "#3b82f6",
    },
    {
      id: "2",
      title: "Occupied",
      start: WEEK.add({ days: 2 }).set({ hour: 13, minute: 0 }),
      end: WEEK.add({ days: 2 }).set({ hour: 14, minute: 0 }),
      color: "#ef4444",
    },
  ]

  let events = $state.raw(INITIAL)
  let log = $state<string[]>([])

  const id = $props.id()
  const service = useMachine(scheduler.machine, (): scheduler.Props => ({
    id,
    defaultView: "day",
    defaultDate: WEEK.add({ days: 2 }),
    dayStartHour: 7,
    dayEndHour: 20,
    events,
    // reject anything outside business hours or overlapping another event
    canDropEvent({ event, newStart, newEnd }) {
      // DateValue may be a date without a time, so narrow before reading the hour
      const start = toCalendarDateTime(newStart)
      const end = toCalendarDateTime(newEnd)
      if (start.hour < BUSINESS_START || end.hour > BUSINESS_END) return false
      return !events.some(
        (other) => other.id !== event.id && newStart.compare(other.end) < 0 && newEnd.compare(other.start) > 0,
      )
    },
    onEventDrop(details) {
      log = [...log, `drop:${details.event.id}`]
      events = events.map((e) =>
        e.id === details.event.id ? { ...e, start: details.newStart, end: details.newEnd } : e,
      )
    },
  }))

  const api = $derived(scheduler.connect(service, normalizeProps))
</script>

<main class="scheduler">
  <p>
    Business hours {BUSINESS_START}:00–{BUSINESS_END}:00. Dragging outside them, or onto &ldquo;Occupied&rdquo;, marks
    the event <code>data-invalid</code> and the release is rejected.
  </p>

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
      <div class="scheduler-time-grid-scroll" tabindex="0" role="group" aria-label="Time grid">
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
                {#each api.getEventsForColumn(column) as event (event.id)}
                  <div {...api.getEventProps({ event })}>
                    <div class="scheduler-event-title">{event.title}</div>
                    <div {...api.getEventResizeHandleProps({ event, edge: "end" })}>
                      <div class="scheduler-resize-grip"></div>
                    </div>
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

  <div data-testid="drop-log">{log.join(" ")}</div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
