<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerAnchor, schedulerResourceEvents, schedulerResources } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/scheduler.css"

  const events = schedulerResourceEvents

  const id = $props.id()
  const service = useMachine(scheduler.machine, {
    id,
    defaultView: "timeline",
    resources: schedulerResources,
    defaultDate: schedulerAnchor,
    events,
  })

  const api = $derived(scheduler.connect(service, normalizeProps))
  const timeline = $derived(api.getTimelineState())
</script>

<main class="scheduler">
  <div {...api.getRootProps()}>
    <div {...api.getHeaderProps()}>
      <button {...api.getPrevTriggerProps()}>‹</button>
      <button {...api.getTodayTriggerProps()}>Today</button>
      <button {...api.getNextTriggerProps()}>›</button>
      <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
    </div>

    <div {...api.getTimelineProps()}>
      <div {...api.getTimelineHeaderProps()}>
        <div class="scheduler-timeline-corner"></div>
        <div class="scheduler-timeline-axis">
          {#each timeline.slots as slot (slot.start.toString())}
            <div {...api.getTimelineSlotProps({ slot })}>
              {slot.label}
            </div>
          {/each}
        </div>
      </div>

      {#each timeline.rows as row (row.id)}
        <div {...api.getTimelineRowProps({ row })}>
          <div {...api.getTimelineRowHeaderProps({ row })}>{row.title}</div>
          <div {...api.getTimelineTrackProps({ row })}>
            {#each api.getEventsForRow(row) as event (event.id)}
              <div {...api.getEventProps({ event, layout: "timeline" })}>
                <span class="scheduler-event-title">{event.title}</span>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
