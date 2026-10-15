<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerAnchor, schedulerControls, schedulerRecurringEvents } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronLeftIcon, ChevronRightIcon } from "lucide-svelte"
  import "@styles/scheduler.css"

  const controls = useControls(schedulerControls)

  const id = $props.id()
  const controlProps = controls.mergeProps<scheduler.Props>({ id })
  const service = useMachine(scheduler.machine, (): scheduler.Props => ({
    ...controlProps(),
    defaultDate: schedulerAnchor,
    events: schedulerRecurringEvents,
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
      <span {...api.getHeaderTitleProps()}>
        {api.visibleRangeText.formatted} · {api.events.length} expanded events
      </span>
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
                {#each api.getEventsForDay(date) as event (event.id)}
                  <div {...api.getEventProps({ event })}>
                    <div class="scheduler-event-title">{event.title}</div>
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

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
