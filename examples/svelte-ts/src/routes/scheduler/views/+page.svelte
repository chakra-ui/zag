<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerAnchor, schedulerControls, schedulerEvents } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronLeftIcon, ChevronRightIcon } from "lucide-svelte"
  import "@styles/scheduler.css"

  const controls = useControls(schedulerControls)
  let events = $state.raw(schedulerEvents)

  const id = $props.id()
  const controlProps = controls.mergeProps<scheduler.Props>({ id })
  const service = useMachine(scheduler.machine, (): scheduler.Props => ({
    ...controlProps(),
    defaultDate: schedulerAnchor,
    events,
    onEventDrop: (d) => {
      events = events.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))
    },
    onEventResize: (d) => {
      events = events.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))
    },
    onEventClick(d) {
      console.log("event clicked", d.event.title)
    },
    onSlotSelect(d) {
      console.log("slot selected", d)
    },
  }))

  const api = $derived(scheduler.connect(service, normalizeProps))
</script>

<main class="scheduler">
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
      <div {...api.getViewSelectProps()}>
        {#each ["day", "week", "month"] as scheduler.ViewType[] as v (v)}
          <button {...api.getViewItemProps({ view: v })}>
            {api.getViewText(v)}
          </button>
        {/each}
      </div>
    </div>

    {#if api.view === "month"}
      <div class="scheduler-month-grid">
        <div class="scheduler-month-header">
          {#each api.getWeekDays() as day}
            <div class="scheduler-month-weekday">
              {day.short}
            </div>
          {/each}
        </div>
        <div class="scheduler-month-body">
          {#each api.getMonthGrid(api.date) as week}
            <!-- segments are asked for one row at a time, so a bar clips at the week edge -->
            {@const bars = api.getAllDaySegments(week)}
            <div class="scheduler-month-week">
              {#each week as date, dayIndex (date.toString())}
                {@const timed = api.getEventsForDay(date).filter((e) => !e.allDay)}
                <div
                  {...mergeProps(api.getDayCellProps({ date, referenceDate: api.date }), {
                    style: { zIndex: week.length - dayIndex },
                  })}
                  class="scheduler-month-cell"
                >
                  <div class="scheduler-month-day-number">{date.day}</div>
                  {#each bars.filter((segment) => segment.column === dayIndex) as segment (segment.event.id)}
                    <div
                      {...api.getEventProps({ event: segment.event, layout: "all-day", segment })}
                      class="scheduler-month-bar"
                    >
                      {segment.event.title}
                    </div>
                  {/each}
                  {#each timed.slice(0, 2) as event (event.id)}
                    <div {...api.getEventProps({ event, layout: "list" })} class="scheduler-month-event">
                      {event.title}
                    </div>
                  {/each}
                  {#if timed.length > 2}
                    <button {...api.getMoreEventsProps({ date, count: timed.length - 2 })}>
                      +{timed.length - 2} more
                    </button>
                  {/if}
                </div>
              {/each}
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="scheduler-time-grid-wrapper">
        <div {...api.getColumnHeadersProps()}>
          <div class="scheduler-gutter-header"></div>
          {#each api.visibleDays as date (`h-${date.toString()}`)}
            <div {...api.getColumnHeaderProps({ date })}>
              <span class="scheduler-header-day-label">{api.formatWeekDay(date)}</span>
              <span class="scheduler-header-day-num">{date.day}</span>
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
              {#each api
                .getAllDaySegments()
                .filter((segment) => segment.column === index) as segment (segment.event.id)}
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
                {@const dayEvents = api.getEventsForDay(date).filter((e) => !e.allDay)}
                <div {...api.getDayColumnProps({ date })}>
                  {#each api.hourRange.hours as hour (hour.value)}
                    <div {...api.getHourLineProps({ hour })}></div>
                  {/each}

                  <div {...api.getCurrentTimeIndicatorProps({ date })}></div>

                  {#each dayEvents as event (event.id)}
                    <div {...api.getEventProps({ event })}>
                      <div class="scheduler-event-title">{event.title}</div>
                      <div class="scheduler-event-time">{event.start.toString().slice(11, 16)}</div>
                      <div {...api.getEventResizeHandleProps({ event, edge: "end" })}>
                        <div class="scheduler-resize-grip"></div>
                      </div>
                    </div>
                  {/each}

                  <div {...api.getDragPreviewProps({ date })}>
                    <div class="scheduler-event-title">{api.dragState?.event.title}</div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
