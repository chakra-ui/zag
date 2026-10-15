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

  const id = $props.id()
  const controlProps = controls.mergeProps<scheduler.Props>({ id })
  const service = useMachine(scheduler.machine, (): scheduler.Props => ({
    ...controlProps(),
    view: "agenda",
    defaultDate: schedulerAnchor,
    events: schedulerEvents,
  }))

  const api = $derived(scheduler.connect(service, normalizeProps))
  const groups = $derived(api.getAgendaGroups())
</script>

<main class="scheduler">
  <div {...mergeProps(api.getRootProps(), { style: { maxWidth: "520px" } })}>
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

    <div class="scheduler-mobile-agenda">
      {#if groups.length === 0}
        <div class="scheduler-mobile-agenda-empty">
          No events between {api.formatLongDate(api.visibleRange.start)} and {api.formatLongDate(api.visibleRange.end)}
        </div>
      {:else}
        {#each groups as group (group.date.toString())}
          <div {...api.getAgendaGroupProps({ date: group.date })}>
            <div {...api.getAgendaGroupTitleProps({ date: group.date })}>{api.formatLongDate(group.date)}</div>
            {#each group.events as event (event.id)}
              <div {...api.getEventProps({ event, layout: "list" })}>
                <div class="scheduler-mobile-agenda-time">{api.formatTimeRange(event.start, event.end)}</div>
                <div class="scheduler-event-title">{event.title}</div>
              </div>
            {/each}
          </div>
        {/each}
      {/if}
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
