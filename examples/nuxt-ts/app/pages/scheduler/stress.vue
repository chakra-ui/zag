<script setup lang="ts">
import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

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

const controls = useControls(schedulerControls)
const count = ref(1000)
const events = ref<scheduler.SchedulerEvent[]>(generate(count.value))

watch(count, (n) => {
  events.value = generate(n)
})

const service = useMachine(
  scheduler.machine,
  controls.mergeProps<scheduler.Props>({
    id: useId(),
    get events() {
      return events.value
    },
    onEventDragEnd: (d) => (events.value = d.apply(events.value)),
    onEventResizeEnd: (d) => (events.value = d.apply(events.value)),
  }),
)

const api = computed(() => scheduler.connect(service, normalizeProps))
const sizeOptions = [100, 500, 1000, 2500, 5000]
</script>

<template>
  <main class="scheduler">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getHeaderProps()">
        <button v-bind="api.getPrevTriggerProps()">{{ api.prevTriggerIcon }}</button>
        <button v-bind="api.getTodayTriggerProps()">{{ api.todayTriggerLabel }}</button>
        <button v-bind="api.getNextTriggerProps()">{{ api.nextTriggerIcon }}</button>
        <span v-bind="api.getHeaderTitleProps()">{{ api.visibleRangeText.formatted }}</span>
        <span :style="{ marginInlineStart: 'auto', fontSize: '12px', color: '#6b7280' }">
          {{ events.length.toLocaleString() }} events
        </span>
        <select v-model.number="count" :style="{ marginLeft: '8px' }">
          <option v-for="n in sizeOptions" :key="n" :value="n">{{ n }} events</option>
        </select>
      </div>

      <div class="scheduler-time-grid-wrapper">
        <div class="scheduler-col-headers">
          <div class="scheduler-header-cell scheduler-gutter-header" />
          <div v-for="(d, i) in api.visibleDays" :key="d.toString()" class="scheduler-header-cell">
            <span class="scheduler-header-day-label">{{ api.weekDays[i % 7].short }}</span>
            <span class="scheduler-header-day-num">{{ d.day }}</span>
          </div>
        </div>

        <div class="scheduler-time-grid-scroll">
          <div v-bind="api.getGridProps()" class="scheduler-time-grid">
            <div v-bind="api.getTimeGutterProps()">
              <div v-for="h in api.hourRange.hours" :key="h.value" :style="h.style" class="scheduler-hour-label">
                {{ h.label }}
              </div>
            </div>

            <div v-for="d in api.visibleDays" :key="d.toString()" v-bind="api.getDayColumnProps({ date: d })">
              <div v-for="h in api.hourRange.hours" :key="h.value" :style="h.style" class="scheduler-hour-line" />
              <div
                v-for="event in api.getEventsForDay(d)"
                :key="event.id"
                v-bind="api.getEventProps({ event })"
                :style="{ ...api.getEventStyle(event), ['--event-color' as any]: event.color }"
              >
                <div class="scheduler-event-title">{{ event.title }}</div>
                <div v-bind="api.getEventResizeHandleProps({ event, edge: 'end' })" class="scheduler-resize-handle">
                  <div class="scheduler-resize-grip" />
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
