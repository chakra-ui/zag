<script lang="ts">
  import SchedulerMiniMonth from "#lib/components/scheduler-mini-month.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import { CalendarDateTime } from "@internationalized/date"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerAnchor, schedulerControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronLeftIcon, ChevronRightIcon } from "lucide-svelte"
  import "@styles/scheduler.css"

  const INITIAL: scheduler.SchedulerEvent[] = Array.from({ length: 12 }, (_, m) => ({
    id: `evt-${m}`,
    title: `Meeting ${m + 1}`,
    start: new CalendarDateTime(schedulerAnchor.year, m + 1, 10 + (m % 15), 10, 0),
    end: new CalendarDateTime(schedulerAnchor.year, m + 1, 10 + (m % 15), 11, 0),
    color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][m % 5],
  }))

  const controls = useControls(schedulerControls)

  const id = $props.id()
  const controlProps = controls.mergeProps<scheduler.Props>({
    id,
    defaultDate: INITIAL[0].start,
    startOfWeek: 1,
  })
  const service = useMachine(scheduler.machine, (): scheduler.Props => ({
    ...controlProps(),
    view: "year",
    events: INITIAL,
  }))

  const api = $derived(scheduler.connect(service, normalizeProps))
  const weekDays = $derived(api.getWeekDays())
</script>

<main class="scheduler scheduler-year-page">
  <div {...api.getRootProps()}>
    <div {...api.getHeaderProps()}>
      <span {...api.getHeaderTitleProps()}>{api.date.year}</span>
      <div class="scheduler-year-nav">
        <button {...api.getPreviousTriggerProps()} aria-label="Previous year">
          <ChevronLeftIcon />
        </button>
        <button {...api.getTodayTriggerProps()}>Today</button>
        <button {...api.getNextTriggerProps()} aria-label="Next year">
          <ChevronRightIcon />
        </button>
      </div>
    </div>

    <div class="scheduler-year-grid">
      {#each api.getMonthNames() as _, i}
        <SchedulerMiniMonth {api} month={i + 1} {weekDays} />
      {/each}
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
