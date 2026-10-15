<script setup lang="ts">
import type { CalendarDateTime } from "@internationalized/date"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls, schedulerEvents } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronLeft, ChevronRight } from "lucide-vue-next"
import "@styles/scheduler.css"

const controls = useControls(schedulerControls)
const controlProps = controls.mergeProps<scheduler.Props>({ id: useId() })
const selectedDate = shallowRef<CalendarDateTime>(schedulerAnchor)

const service = useMachine(
  scheduler.machine,
  computed<scheduler.Props>(() => ({
    ...controlProps.value,
    view: "month",
    defaultDate: schedulerAnchor,
    events: schedulerEvents,
  })),
)

const api = computed(() => scheduler.connect(service, normalizeProps))
const weeks = computed(() => api.value.getMonthGrid(api.value.date))
const selectedDayEvents = computed(() => api.value.getEventsForDay(selectedDate.value))
</script>

<template>
  <main class="scheduler">
    <div v-bind="mergeProps(api.getRootProps(), { style: { maxWidth: '420px' } })">
      <div v-bind="api.getHeaderProps()">
        <button v-bind="api.getPreviousTriggerProps()">
          <ChevronLeft />
        </button>
        <span v-bind="api.getHeaderTitleProps()">{{ api.getMonthName(api.date) }} {{ api.date.year }}</span>
        <button v-bind="api.getNextTriggerProps()">
          <ChevronRight />
        </button>
      </div>

      <div class="scheduler-mobile-month">
        <div class="scheduler-mobile-weekdays">
          <div v-for="(day, i) in api.getWeekDays()" :key="i">{{ day.short }}</div>
        </div>
        <div v-for="(week, wi) in weeks" :key="wi" class="scheduler-mobile-week">
          <button
            v-for="date in week"
            :key="date.toString()"
            type="button"
            v-bind="api.getDayCellProps({ date, referenceDate: api.date })"
            class="scheduler-mobile-day"
            :data-selected="date.compare(selectedDate) === 0 || undefined"
            :aria-label="api.formatLongDate(date)"
            @click="selectedDate = date"
          >
            <span class="scheduler-mobile-day-num">{{ date.day }}</span>
            <span class="scheduler-mobile-dots">
              <span
                v-for="e in api.getEventsForDay(date).slice(0, 3)"
                :key="e.id"
                class="scheduler-mobile-dot"
                :style="{ background: e.color ?? '#3b82f6' }"
              />
            </span>
          </button>
        </div>
      </div>

      <div class="scheduler-mobile-agenda">
        <div v-bind="api.getAgendaGroupTitleProps({ date: selectedDate })">{{ api.formatLongDate(selectedDate) }}</div>
        <div v-if="selectedDayEvents.length === 0" class="scheduler-mobile-agenda-empty">No events</div>
        <template v-else>
          <div v-for="event in selectedDayEvents" :key="event.id" v-bind="api.getEventProps({ event, layout: 'list' })">
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
