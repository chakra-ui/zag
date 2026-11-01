<script setup lang="ts">
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls, schedulerRecurringEvents } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronLeft, ChevronRight } from "lucide-vue-next"
import "@styles/scheduler.css"

const controls = useControls(schedulerControls)
const controlProps = controls.mergeProps<scheduler.Props>({ id: useId() })

const service = useMachine(
  scheduler.machine,
  computed<scheduler.Props>(() => ({
    ...controlProps.value,
    defaultDate: schedulerAnchor,
    events: schedulerRecurringEvents,
  })),
)

const api = computed(() => scheduler.connect(service, normalizeProps))
</script>

<template>
  <main class="scheduler">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getHeaderProps()">
        <button v-bind="api.getPreviousTriggerProps()">
          <ChevronLeft />
        </button>
        <button v-bind="api.getTodayTriggerProps()">Today</button>
        <button v-bind="api.getNextTriggerProps()">
          <ChevronRight />
        </button>
        <span v-bind="api.getHeaderTitleProps()"
          >{{ api.visibleRangeText.formatted }} · {{ api.events.length }} expanded events</span
        >
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
