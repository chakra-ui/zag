<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const TODAY = scheduler.getToday()
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"]

  function seededRandom(seed: number) {
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
      const dayOffset = Math.floor(rand() * 90) - 45
      const startHour = 7 + Math.floor(rand() * 12)
      const startMin = rand() < 0.5 ? 0 : 30
      const durationMin = 30 + Math.floor(rand() * 4) * 30
      const start = TODAY.add({ days: dayOffset }).set({ hour: startHour, minute: startMin })
      const end = start.add({ minutes: durationMin })
      out.push({ id: `e-${i}`, title: `Meeting ${i}`, start, end, color: COLORS[i % COLORS.length] })
    }
    return out
  }

  let count = $state(1000)
  let events = $state<scheduler.SchedulerEvent[]>(generate(1000))

  const controls = useControls(schedulerControls)
  const id = $props.id()
  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>({
      id,
      get events() {
        return events
      },
      onEventDragEnd: (d) => (events = d.apply(events)),
      onEventResizeEnd: (d) => (events = d.apply(events)),
    }),
  )
  const api = $derived(scheduler.connect(service, normalizeProps))
  const sizeOptions = [100, 500, 1000, 2500, 5000]
</script>

<main class="scheduler">
  <div {...api.getRootProps()}>
    <div {...api.getHeaderProps()}>
      <button {...api.getPrevTriggerProps()}>{api.prevTriggerIcon}</button>
      <button {...api.getTodayTriggerProps()}>{api.todayTriggerLabel}</button>
      <button {...api.getNextTriggerProps()}>{api.nextTriggerIcon}</button>
      <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
      <span style="margin-inline-start:auto;font-size:12px;color:#6b7280">
        {events.length.toLocaleString()} events
      </span>
      <select
        bind:value={count}
        onchange={() => (events = generate(count))}
        style="margin-left:8px"
      >
        {#each sizeOptions as n (n)}
          <option value={n}>{n} events</option>
        {/each}
      </select>
    </div>

    <div class="scheduler-time-grid-wrapper">
      <div class="scheduler-col-headers">
        <div class="scheduler-header-cell scheduler-gutter-header"></div>
        {#each api.visibleDays as d, i (d.toString())}
          <div class="scheduler-header-cell">
            <span class="scheduler-header-day-label">{api.weekDays[i % 7].short}</span>
            <span class="scheduler-header-day-num">{d.day}</span>
          </div>
        {/each}
      </div>

      <div class="scheduler-time-grid-scroll">
        <div {...api.getGridProps()} class="scheduler-time-grid">
          <div {...api.getTimeGutterProps()}>
            {#each api.hourRange.hours as h (h.value)}
              <div class="scheduler-hour-label" style={h.style}>{h.label}</div>
            {/each}
          </div>

          {#each api.visibleDays as d (d.toString())}
            <div {...api.getDayColumnProps({ date: d })}>
              {#each api.hourRange.hours as h (h.value)}
                <div class="scheduler-hour-line" style={h.style}></div>
              {/each}
              {#each api.getEventsForDay(d) as event (event.id)}
                <div
                  {...api.getEventProps({ event })}
                  style="--event-color: {event.color}; {Object.entries(api.getEventStyle(event))
                    .map(([k, v]) => `${k}:${v}`)
                    .join(';')}"
                >
                  <div class="scheduler-event-title">{event.title}</div>
                  <div {...api.getEventResizeHandleProps({ event, edge: "end" })} class="scheduler-resize-handle">
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
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
