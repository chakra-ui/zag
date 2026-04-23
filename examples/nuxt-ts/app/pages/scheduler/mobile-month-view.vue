<script setup lang="ts">
import type { DateValue } from "@internationalized/date"
import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const TODAY = scheduler.getToday()

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Team standup",
    start: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 0 }),
    end: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 30 }),
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Design review",
    start: TODAY.subtract({ days: 2 }).set({ hour: 10, minute: 0 }),
    end: TODAY.subtract({ days: 2 }).set({ hour: 11, minute: 30 }),
    color: "#10b981",
  },
  {
    id: "3",
    title: "Lunch",
    start: TODAY.set({ hour: 12, minute: 0 }),
    end: TODAY.set({ hour: 13, minute: 0 }),
    color: "#f59e0b",
  },
  {
    id: "4",
    title: "1:1 with manager",
    start: TODAY.set({ hour: 15, minute: 0 }),
    end: TODAY.set({ hour: 16, minute: 0 }),
    color: "#8b5cf6",
  },
  {
    id: "5",
    title: "Demo day",
    start: TODAY.add({ days: 7 }).set({ hour: 14, minute: 0 }),
    end: TODAY.add({ days: 7 }).set({ hour: 15, minute: 30 }),
    color: "#ef4444",
  },
]

const controls = useControls(schedulerControls)
const selectedDate = ref<DateValue>(TODAY)

const service = useMachine(
  scheduler.machine,
  controls.mergeProps<scheduler.Props>({
    id: useId(),
    view: "month",
    events: INITIAL,
  }),
)

const api = computed(() => scheduler.connect(service, normalizeProps))
</script>

<template>
  <main class="scheduler">
    <div v-bind="api.getRootProps()" :style="{ maxWidth: '420px' }">
      <div v-bind="api.getHeaderProps()">
        <button v-bind="api.getPrevTriggerProps()">{{ api.prevTriggerIcon }}</button>
        <span v-bind="api.getHeaderTitleProps()">{{ api.getMonthName(api.date) }} {{ api.date.year }}</span>
        <button v-bind="api.getNextTriggerProps()">{{ api.nextTriggerIcon }}</button>
      </div>

      <div class="scheduler-mobile-month">
        <div class="scheduler-mobile-weekdays">
          <div v-for="(d, i) in api.weekDays" :key="i">{{ d.short }}</div>
        </div>
        <div v-for="(week, wi) in api.getMonthGrid(api.date)" :key="wi" class="scheduler-mobile-week">
          <button
            v-for="cell in week"
            :key="cell.date.toString()"
            type="button"
            v-bind="api.getDayCellProps({ date: cell.date, referenceDate: api.date })"
            class="scheduler-mobile-day"
            :data-selected="cell.date.compare(selectedDate) === 0 || undefined"
            :aria-label="api.formatLongDate(cell.date)"
            @click="selectedDate = cell.date"
          >
            <span class="scheduler-mobile-day-num">{{ cell.date.day }}</span>
            <span class="scheduler-mobile-dots">
              <span
                v-for="e in api.getEventsForDay(cell.date).slice(0, 3)"
                :key="e.id"
                class="scheduler-mobile-dot"
                :style="{ background: e.color ?? '#3b82f6' }"
              />
            </span>
          </button>
        </div>
      </div>

      <div class="scheduler-mobile-agenda">
        <div class="scheduler-mobile-agenda-title">{{ api.formatLongDate(selectedDate) }}</div>
        <div v-if="api.getEventsForDay(selectedDate).length === 0" class="scheduler-mobile-agenda-empty">
          No events
        </div>
        <template v-else>
          <div
            v-for="event in api.getEventsForDay(selectedDate)"
            :key="event.id"
            v-bind="api.getEventProps({ event })"
            class="scheduler-mobile-agenda-event"
            :style="{ ['--event-color' as any]: event.color ?? '#3b82f6' }"
          >
            <div class="scheduler-mobile-agenda-time">{{ api.formatTimeRange(event.start, event.end) }}</div>
            <div class="scheduler-event-title">{{ event.title }}</div>
          </div>
        </template>
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
