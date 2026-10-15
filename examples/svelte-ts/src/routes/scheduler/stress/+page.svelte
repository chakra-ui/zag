<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerAnchor, schedulerControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronLeftIcon, ChevronRightIcon } from "lucide-svelte"
  import "@styles/scheduler.css"

  const TODAY = schedulerAnchor
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"]

  function seededRandom(seed: number) {
    // Deterministic PRNG so the benchmark is reproducible across reloads.
    let s = seed
    return () => {
      s = (s * 9301 + 49297) % 233280
      return s / 233280
    }
  }

  function generate(count: number): scheduler.SchedulerEvent[] {
    const rand = seededRandom(count)
    const out: scheduler.SchedulerEvent[] = []
    for (let i = 0; i < count; i++) {
      // Spread across ~90 days centered on today so every visible range has
      // hundreds of events without creating impossibly packed days.
      const dayOffset = Math.floor(rand() * 90) - 45
      const startHour = 7 + Math.floor(rand() * 12) // 7..18
      const startMin = rand() < 0.5 ? 0 : 30
      const durationMin = 30 + Math.floor(rand() * 4) * 30 // 30..120
      const start = TODAY.add({ days: dayOffset }).set({ hour: startHour, minute: startMin })
      const end = start.add({ minutes: durationMin })
      out.push({
        id: `e-${i}`,
        title: `Meeting ${i}`,
        start,
        end,
        color: COLORS[i % COLORS.length],
      })
    }
    return out
  }

  const controls = useControls(schedulerControls)
  let count = $state(1000)
  const events = $derived(generate(count))
  let tick = $state(0)

  // Mutate in place and bump tick, so the machine gets a fresh list
  function updateEvent(d: scheduler.EventDropDetails | scheduler.EventResizeDetails) {
    const i = events.findIndex((e) => e.id === d.event.id)
    if (i >= 0) events[i] = { ...events[i], start: d.newStart, end: d.newEnd }
    tick++
  }

  const id = $props.id()
  const controlProps = controls.mergeProps<scheduler.Props>({ id })
  const service = useMachine(scheduler.machine, (): scheduler.Props => {
    tick
    return {
      ...controlProps(),
      defaultDate: schedulerAnchor,
      events: [...events],
      onEventDrop: updateEvent,
      onEventResize: updateEvent,
    }
  })

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
      <span style="margin-inline-start: auto; font-size: 12px; color: #6b7280">
        {events.length.toLocaleString()} events ({api.getEventsForDay.name ? "O(1) lookups" : ""})
      </span>
      <select value={count} onchange={(e) => (count = Number(e.currentTarget.value))} style="margin-left: 8px">
        {#each [100, 500, 1000, 2500, 5000] as n (n)}
          <option value={n}>
            {n} events
          </option>
        {/each}
      </select>
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
                    <div {...api.getEventResizeHandleProps({ event, edge: "end" })}>
                      <div class="scheduler-resize-grip"></div>
                    </div>
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
