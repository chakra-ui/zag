<script setup lang="ts">
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronLeft, ChevronRight } from "lucide-vue-next"
import "@styles/scheduler.css"

const controls = useControls(schedulerControls)
const controlProps = controls.mergeProps<scheduler.Props>({ id: useId() })

const TODAY = schedulerAnchor
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"]

function seededRandom(seed: number) {
  // Deterministic PRNG so the benchmark is reproducible across reloads
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
    // Spread across ~90 days centered on today
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

const count = ref(1000)
const events = shallowRef(generate(count.value))
watch(count, (n) => {
  events.value = generate(n)
})

// Mutate in place and trigger, so the machine gets a fresh list
function updateEvent(d: scheduler.EventDropDetails | scheduler.EventResizeDetails) {
  const list = events.value
  const i = list.findIndex((e) => e.id === d.event.id)
  if (i >= 0) list[i] = { ...list[i]!, start: d.newStart, end: d.newEnd }
  triggerRef(events)
}

const service = useMachine(
  scheduler.machine,
  computed<scheduler.Props>(() => ({
    ...controlProps.value,
    defaultDate: schedulerAnchor,
    events: [...events.value],
    onEventDrop: updateEvent,
    onEventResize: updateEvent,
  })),
)

const api = computed(() => scheduler.connect(service, normalizeProps))
</script>

<template>
  <main class="scheduler">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getHeaderProps()">
        <button v-bind="api.getPrevTriggerProps()">
          <ChevronLeft />
        </button>
        <button v-bind="api.getTodayTriggerProps()">Today</button>
        <button v-bind="api.getNextTriggerProps()">
          <ChevronRight />
        </button>
        <span v-bind="api.getHeaderTitleProps()">{{ api.visibleRangeText.formatted }}</span>
        <span style="margin-inline-start: auto; font-size: 12px; color: #6b7280">
          {{ events.length.toLocaleString() }} events ({{ api.getEventsForDay.name ? "O(1) lookups" : "" }})
        </span>
        <select
          :value="count"
          style="margin-left: 8px"
          @change="count = Number(($event.currentTarget as HTMLSelectElement).value)"
        >
          <option v-for="n in [100, 500, 1000, 2500, 5000]" :key="n" :value="n">{{ n }} events</option>
        </select>
      </div>

      <div class="scheduler-time-grid-wrapper">
        <div v-bind="api.getColumnHeadersProps()">
          <div class="scheduler-gutter-header" />
          <div v-for="date in api.visibleDays" :key="date.toString()" v-bind="api.getColumnHeaderProps({ date })">
            <span class="scheduler-header-day-label">{{ api.formatWeekDay(date) }}</span>
            <span class="scheduler-header-day-num">{{ date.day }}</span>
          </div>
        </div>
        <div class="scheduler-time-grid-scroll" tabindex="0" role="group" aria-label="Time grid">
          <div v-bind="api.getGridProps()">
            <div v-bind="api.getGridRowProps()">
              <div v-bind="api.getTimeGutterProps()">
                <div v-for="hour in api.hourRange.hours" :key="hour.value" v-bind="api.getHourLabelProps({ hour })">
                  {{ hour.label }}
                </div>
              </div>

              <div v-for="date in api.visibleDays" :key="date.toString()" v-bind="api.getDayColumnProps({ date })">
                <div v-for="hour in api.hourRange.hours" :key="hour.value" v-bind="api.getHourLineProps({ hour })" />
                <div v-bind="api.getCurrentTimeIndicatorProps({ date })" />
                <div v-for="event in api.getEventsForDay(date)" :key="event.id" v-bind="api.getEventProps({ event })">
                  <div class="scheduler-event-title">{{ event.title }}</div>
                  <div v-bind="api.getEventResizeHandleProps({ event, edge: 'end' })">
                    <div class="scheduler-resize-grip" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
