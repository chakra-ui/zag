<script setup lang="ts">
import { CalendarDateTime } from "@internationalized/date"
import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const INITIAL: scheduler.SchedulerEvent[] = Array.from({ length: 12 }, (_, m) => ({
  id: `evt-${m}`,
  title: `Meeting ${m + 1}`,
  start: new CalendarDateTime(2026, m + 1, 10 + (m % 15), 10, 0),
  end: new CalendarDateTime(2026, m + 1, 10 + (m % 15), 11, 0),
  color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][m % 5],
}))

const controls = useControls(schedulerControls)

const service = useMachine(
  scheduler.machine,
  controls.mergeProps<scheduler.Props>({
    id: useId(),
    defaultDate: INITIAL[0].start,
    view: "year",
    events: INITIAL,
  }),
)

const api = computed(() => scheduler.connect(service, normalizeProps))

function monthReference(month: number) {
  return api.value.date.set({ month, day: 1 })
}
</script>

<template>
  <main class="scheduler">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getHeaderProps()">
        <button v-bind="api.getPrevTriggerProps()">{{ api.prevTriggerIcon }}</button>
        <button v-bind="api.getTodayTriggerProps()">{{ api.todayTriggerLabel }}</button>
        <button v-bind="api.getNextTriggerProps()">{{ api.nextTriggerIcon }}</button>
        <span v-bind="api.getHeaderTitleProps()">{{ api.date.year }}</span>
      </div>

      <div class="scheduler-year-grid">
        <div v-for="(_, i) in api.monthNames" :key="i" class="scheduler-mini-month">
          <div class="scheduler-mini-month-title">{{ api.getMonthName(monthReference(i + 1)) }}</div>
          <div class="scheduler-mini-weekdays">
            <div v-for="(d, di) in api.weekDays" :key="di">{{ d.narrow }}</div>
          </div>
          <div v-for="(week, wi) in api.getMonthGrid(monthReference(i + 1))" :key="wi" class="scheduler-mini-week">
            <div
              v-for="cell in week"
              :key="cell.date.toString()"
              v-bind="api.getDayCellProps({ date: cell.date, referenceDate: monthReference(i + 1) })"
              class="scheduler-mini-day"
            >
              <span>{{ cell.date.day }}</span>
              <span
                v-if="api.getEventsForDay(cell.date).length > 0"
                class="scheduler-mini-dot"
                :style="{ background: api.getEventsForDay(cell.date)[0].color ?? '#3b82f6' }"
              />
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
