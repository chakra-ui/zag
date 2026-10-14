<script setup lang="ts">
import { CalendarDateTime } from "@internationalized/date"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronLeft, ChevronRight } from "lucide-vue-next"
import "@styles/scheduler.css"

const INITIAL: scheduler.SchedulerEvent[] = Array.from({ length: 12 }, (_, m) => ({
  id: `evt-${m}`,
  title: `Meeting ${m + 1}`,
  start: new CalendarDateTime(schedulerAnchor.year, m + 1, 10 + (m % 15), 10, 0),
  end: new CalendarDateTime(schedulerAnchor.year, m + 1, 10 + (m % 15), 11, 0),
  color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][m % 5],
}))

const controls = useControls(schedulerControls)
const controlProps = controls.mergeProps<scheduler.Props>({ id: useId() })

const service = useMachine(
  scheduler.machine,
  computed<scheduler.Props>(() => ({
    defaultDate: INITIAL[0]!.start,
    startOfWeek: 1,
    ...controlProps.value,
    view: "year",
    events: INITIAL,
  })),
)

const api = computed(() => scheduler.connect(service, normalizeProps))
const weekDays = computed(() => api.value.getWeekDays())
</script>

<template>
  <main class="scheduler scheduler-year-page">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getHeaderProps()">
        <span v-bind="api.getHeaderTitleProps()">{{ api.date.year }}</span>
        <div class="scheduler-year-nav">
          <button v-bind="api.getPrevTriggerProps()" aria-label="Previous year">
            <ChevronLeft />
          </button>
          <button v-bind="api.getTodayTriggerProps()">Today</button>
          <button v-bind="api.getNextTriggerProps()" aria-label="Next year">
            <ChevronRight />
          </button>
        </div>
      </div>

      <div class="scheduler-year-grid">
        <SchedulerMiniMonth
          v-for="(_, i) in api.getMonthNames()"
          :key="i"
          :api="api"
          :month="i + 1"
          :week-days="weekDays"
        />
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
