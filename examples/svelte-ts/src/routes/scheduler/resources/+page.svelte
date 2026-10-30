<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerAnchor, schedulerResourceEvents, schedulerResources } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/scheduler.css"

  let events = $state.raw(schedulerResourceEvents)
  let log = $state<string[]>([])

  const id = $props.id()
  const service = useMachine(scheduler.machine, (): scheduler.Props => ({
    id,
    defaultView: "day",
    dayStartHour: 8,
    dayEndHour: 18,
    resources: schedulerResources,
    groupBy: "resource",
    defaultDate: schedulerAnchor,
    events,
    onEventDrop(details) {
      log = [...log, `drop:${details.event.id}:${details.resource?.id ?? "none"}`]
      events = events.map((e) =>
        e.id === details.event.id
          ? { ...e, start: details.newStart, end: details.newEnd, resourceId: details.resource?.id ?? e.resourceId }
          : e,
      )
    },
    onSlotSelect(details) {
      log = [...log, `slot:${details.resource?.id ?? "none"}`]
    },
  }))

  const api = $derived(scheduler.connect(service, normalizeProps))
</script>

<main class="scheduler">
  <div {...api.getRootProps()}>
    <div {...api.getHeaderProps()}>
      <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
    </div>

    <div class="scheduler-time-grid-wrapper">
      <div {...api.getColumnHeadersProps()}>
        <div class="scheduler-gutter-header"></div>
        {#each api.columns as column (`${column.date}:${column.resource?.id}`)}
          <div {...api.getColumnHeaderProps(column)}>
            <span class="scheduler-header-day-label">{column.resource?.title}</span>
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

            {#each api.columns as column (`${column.date}:${column.resource?.id}`)}
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
