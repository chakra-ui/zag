<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerAllDayEvents, schedulerAnchor, schedulerControls } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronLeftIcon, ChevronRightIcon } from "lucide-svelte"
  import "@styles/scheduler.css"

  const controls = useControls(schedulerControls)
  let events = $state.raw(schedulerAllDayEvents)
  let dropLog = $state("")
  let maxAllDayRows = $state<number | undefined>(undefined)

  const id = $props.id()
  const controlProps = controls.mergeProps<scheduler.Props>({ id })
  const service = useMachine(scheduler.machine, (): scheduler.Props => ({
    ...controlProps(),
    defaultDate: schedulerAnchor,
    maxAllDayRows,
    events,
    onEventDrop(d) {
      // the machine reports the region it landed in; converting the event is the consumer's call
      dropLog = `${d.event.id} allDay:${d.allDay} ${d.newStart} → ${d.newEnd} Δ${d.delta.days}d${d.delta.minutes}m`
      events = events.map((e) =>
        e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd, allDay: d.allDay } : e,
      )
    },
    onEventResize: (d) => {
      events = events.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))
    },
  }))

  const api = $derived(scheduler.connect(service, normalizeProps))
</script>

<main class="scheduler">
  <output data-testid="drop-log">{dropLog}</output>
  <label>
    <input
      type="checkbox"
      data-testid="cap-rows"
      checked={maxAllDayRows === 1}
      onchange={(e) => (maxAllDayRows = e.currentTarget.checked ? 1 : undefined)}
    />
    Cap the all-day row at one level
  </label>
  <div {...api.getRootProps()}>
    <div {...api.getHeaderProps()}>
      <button {...api.getPreviousTriggerProps()}>
        <ChevronLeftIcon />
      </button>
      <button {...api.getTodayTriggerProps()}>Today</button>
      <button {...api.getNextTriggerProps()}>
        <ChevronRightIcon />
      </button>
      <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
    </div>

    <div class="scheduler-time-grid-wrapper">
      <div {...api.getColumnHeadersProps()}>
        <div class="scheduler-gutter-header"></div>
        {#each api.visibleDays as date (date.toString())}
          <div {...api.getColumnHeaderProps({ date })}>
            <span class="scheduler-header-day-label">{api.formatWeekDay(date)}</span>
            <span class="scheduler-header-day-num">{date.day}</span>
          </div>
        {/each}
      </div>

      <div {...api.getAllDayRowProps()}>
        <div {...api.getAllDayLabelProps()}>All day</div>
        {#each api.visibleDays as date, index (date.toString())}
          <!-- a bar overflows to the right, so earlier cells must paint above later ones -->
          <div
            {...mergeProps(api.getDayCellProps({ date, allDay: true }), {
              style: { zIndex: api.visibleDays.length - index },
            })}
          >
            {#each api.getAllDayOverflow().filter((entry) => entry.date.compare(date) === 0) as entry}
              <button {...api.getMoreEventsProps({ date, count: entry.count })} class="scheduler-all-day-more">
                +{entry.count} more
              </button>
            {/each}
            <!-- a bar lives in the cell it starts on and overflows across the ones it covers -->
            {#each api.getAllDaySegments().filter((segment) => segment.column === index) as segment (segment.event.id)}
              <div {...api.getEventProps({ event: segment.event, layout: "all-day", segment })}>
                {#if segment.isStart}
                  <div {...api.getEventResizeHandleProps({ event: segment.event, edge: "start" })}></div>
                {/if}
                <span class="scheduler-event-title">{segment.event.title}</span>
                {#if segment.isEnd}
                  <div {...api.getEventResizeHandleProps({ event: segment.event, edge: "end" })}></div>
                {/if}
              </div>
            {/each}
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

            {#each api.visibleDays as date (date.toString())}
              <div {...api.getDayColumnProps({ date })}>
                {#each api.hourRange.hours as hour (hour.value)}
                  <div {...api.getHourLineProps({ hour })}></div>
                {/each}
                <div {...api.getCurrentTimeIndicatorProps({ date })}></div>
                {#each api.getEventsForDay(date).filter((e) => !e.allDay) as event (event.id)}
                  <div {...api.getEventProps({ event })}>
                    <div class="scheduler-event-title">{event.title}</div>
                    <div {...api.getEventResizeHandleProps({ event, edge: "end" })}>
                      <div class="scheduler-resize-grip"></div>
                    </div>
                  </div>
                {/each}
                <div {...api.getDragOriginProps({ date })}></div>
                <div {...api.getDragPreviewProps({ date })}>
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

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
