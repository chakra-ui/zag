<script setup lang="ts">
import type * as scheduler from "@zag-js/scheduler"

const props = defineProps<{ api: scheduler.Api; month: number; weekDays: scheduler.WeekDay[] }>()

const reference = computed(() => props.api.date.set({ month: props.month, day: 1 }))
const weeks = computed(() => props.api.getMonthGrid(reference.value))
</script>

<template>
  <section class="scheduler-mini-month">
    <h3 class="scheduler-mini-month-title">{{ api.getMonthName(reference) }}</h3>
    <div v-bind="api.getMonthGridProps({ date: reference })">
      <div v-bind="api.getWeekdayHeaderRowProps()" class="scheduler-mini-weekdays">
        <div v-for="day in weekDays" :key="day.long" v-bind="api.getWeekdayHeaderCellProps({ day })">
          {{ day.narrow }}
        </div>
      </div>
      <div v-for="(week, wi) in weeks" :key="wi" v-bind="api.getWeekRowProps()" class="scheduler-mini-week">
        <div
          v-for="date in week"
          :key="date.toString()"
          v-bind="api.getDayCellProps({ date, referenceDate: reference })"
        >
          <div v-bind="api.getDayCellTriggerProps({ date, referenceDate: reference })" class="scheduler-mini-day">
            <span aria-hidden="true">{{ date.day }}</span>
            <span
              v-if="api.getEventsForDay(date).length > 0"
              aria-hidden="true"
              class="scheduler-mini-dot"
              :style="{ background: api.getEventsForDay(date)[0]!.color ?? '#3b82f6' }"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
